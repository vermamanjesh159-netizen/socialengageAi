import time
import re
import requests
import logging
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from app.config import settings
from app.models.user import User
from app.models.persona import Persona
from app.models.history import CommentHistory
from app.services.ollama_service import ollama_service
from app.services.persona_service import persona_service
from app.services.platform_service import platform_service
from app.services.history_service import history_service
from app.services.web_search_service import web_search_service

logger = logging.getLogger(__name__)

class CommentService:
    def check_saas_limit(self, db: Session, user: User, count: int = 1) -> bool:
        """Verify if user has enough quota in their SaaS plan to generate comments"""
        if user.is_admin:
            return True
            
        plan_limits = {
            "Free": 100,
            "Pro": 5000,
            "Business": 9999999
        }
        
        limit = plan_limits.get(user.plan, 100)
        if user.comments_used_this_month + count > limit:
            return False
        return True

    def increment_saas_usage(self, db: Session, user: User, count: int = 1) -> None:
        """Increment user's monthly comment usage"""
        user.comments_used_this_month += count
        db.commit()

    def generate_comment(
        self,
        db: Session,
        user: User,
        platform: str,
        content_text: str,
        comment_style: str = "Friendly",
        persona_id: Optional[int] = None,
        temperature: float = 0.8,
        comment_length: str = "medium",
        content_url: Optional[str] = None,
        comment_type: str = "comment",
        web_search: bool = False
    ) -> Dict[str, Any]:
        """Generate a single comment, caption, bio, or hashtags pack with advanced quality metrics"""
        # 1. Limit Check
        if not self.check_saas_limit(db, user, 1):
            raise ValueError(f"SaaS Plan Limit Exceeded! {user.plan} plan is capped at the monthly quota limit.")
            
        # 2. Get Persona details if provided
        persona = None
        if persona_id:
            persona = persona_service.get_persona(db, persona_id, user.id)
            
        # 3. Get Platform Details
        plat_details = platform_service.get_platform_details(platform)
        platform_rules = plat_details["rules"]
        
        # 4. Compile Prompts
        personality_prompt = persona_service.build_personality_prompt(persona)
        
        # Capture original content_text to save to history, but augment content_text for LLM generation if web search is enabled
        original_content_text = content_text
        
        # Define current date context (simulated today is June 11, 2026)
        from datetime import datetime
        now = datetime.now()
        current_month_year = now.strftime("%B %Y")
        current_date_full = now.strftime("%B %d, %Y")
        
        # Auto-enable web search for newsletters or queries referencing breaking news to ensure verifiability
        is_news_query = any(word in content_text.lower() for word in ["news", "latest", "breakthrough", "update", "this week"])
        if comment_type == "newsletter" or is_news_query:
            web_search = True
            
        if web_search:
            clean_query = re.sub(r'\s*\(Variation\s*#\d+\)\s*$', '', content_text, flags=re.IGNORECASE)
            
            # Optimize search query to fetch actual news roundups rather than homepages/category pages
            q_clean = clean_query.lower()
            q_clean = re.sub(r'[^\w\s]', '', q_clean)
            q_clean = re.sub(r'\b(top\s*\d*|best|latest|this\s*week|this\s*month|this\s*year|today)\b', '', q_clean)
            q_clean = re.sub(r'\s+', ' ', q_clean).strip()
            
            if not q_clean or q_clean in ["news", "ai", "artificial intelligence"]:
                search_query = f"AI news {current_month_year}"
                search_query_secondary = f"latest AI model releases {current_month_year}"
            else:
                if "news" in q_clean or "breakthrough" in q_clean or "update" in q_clean or "trend" in q_clean or "happen" in q_clean:
                    if "ai" not in q_clean and "artificial intelligence" not in q_clean:
                        search_query = f"{q_clean} AI news {current_month_year}"
                    else:
                        search_query = f"{q_clean} {current_month_year}"
                else:
                    search_query = f"{q_clean} {current_month_year}"
                search_query_secondary = f"new AI model launch {current_month_year}"
            
            search_results = web_search_service.search(search_query)
            secondary_results = web_search_service.search(search_query_secondary)
            
            seen_links = set()
            merged_results = []
            
            # Interleave starting with secondary results (latest model releases/launches)
            max_len = max(len(search_results), len(secondary_results))
            for i in range(max_len):
                if i < len(secondary_results):
                    res = secondary_results[i]
                    link = res.get("link", "")
                    if link and link not in seen_links:
                        seen_links.add(link)
                        merged_results.append(res)
                if i < len(search_results):
                    res = search_results[i]
                    link = res.get("link", "")
                    if link and link not in seen_links:
                        seen_links.add(link)
                        merged_results.append(res)
            
            search_results = merged_results[:10]
            
            if search_results:
                # Retrieve links for TinyFish content fetching
                links = [res["link"] for res in search_results if res.get("link")]
                page_contents = web_search_service.fetch_pages_content(links)
                
                search_context = "\n--- REAL-TIME WEB SEARCH RESULTS (Latest up-to-date information) ---\n"
                for idx, res in enumerate(search_results[:8], 1):
                    link = res.get('link', '')
                    search_context += f"Result #{idx}:\nTitle: {res['title']}\nSource: {link}\n"
                    if link in page_contents:
                        search_context += f"Full Page Excerpt (via TinyFish):\n{page_contents[link]}\n\n"
                    else:
                        search_context += f"Snippet: {res['snippet']}\n\n"
                search_context += "----------------------------------------------------------------------\n"
                
                content_text = (
                    f"CRITICAL REQUIREMENT: The user wants real-time/present state news aggregation for today's date ({current_date_full}). "
                    f"You MUST base your response entirely on the search results below. "
                    f"DO NOT utilize your pre-trained historical knowledge to talk about old events from 2021, 2022, 2023, or 2024.\n\n"
                    f"You MUST follow these link and title citation rules:\n"
                    f"1. For each news item you write, you MUST use the EXACT article title provided in the search results below.\n"
                    f"2. You MUST hyperlink the article title to its source URL in markdown format. Example: `[Exact Article Title](URL)`.\n"
                    f"3. Cite the name of the source publisher (e.g. [TechCrunch] or [Reuters]) next to the link.\n"
                    f"4. If you cannot find recent/specific June 2026 news details in the search results, explicitly state that no verified news from this period was found in the sources.\n\n"
                    f"Real-Time Web Search Results:\n{search_context}\n\n"
                    f"User Request / Topic:\n\"{content_text}\"\n"
                )
        
        length_guidelines = {
            "short": "extremely short (under 15 words or 1 sentence)",
            "medium": "moderate length (2-3 sentences or under 50 words)",
            "long": "elaborate and detailed (4+ sentences or 70-150 words)"
        }
        length_prompt = length_guidelines.get(comment_length.lower(), length_guidelines["medium"])
        
        if comment_type == "caption":
            prompt = f"""
            Write a highly engaging {comment_style} social media post caption/body for this platform: {platform}.
            Post Content / Topic Context:
            "{content_text}"
            
            Platform-specific rules:
            - Platform: {platform}
            - Rules: {platform_rules}
            - Length constraint: {length_prompt}
            
            {personality_prompt}
            
            Guidelines:
            - Must sound like an authentic human post or content share.
            - Do not output introductory text like "Here is your caption:".
            - Include 1-3 highly relevant emojis and hashtags appropriate for {platform}.
            
            Generated Caption:
            """
        elif comment_type == "bio":
            prompt = f"""
            Write a creative and professional {comment_style} social media bio/description for this platform: {platform}.
            User Details / Career Background:
            "{content_text}"
            
            Platform-specific rules:
            - Platform: {platform}
            - Rules: {platform_rules}
            - Length constraint: under 150 characters (or typical platform bio length)
            
            {personality_prompt}
            
            Guidelines:
            - Summarize their value proposition clearly.
            - Do not output introductory text.
            - Include 1 relevant emoji.
            
            Generated Bio:
            """
        elif comment_type == "hashtags":
            prompt = f"""
            Write a pack of relevant, trending, and highly targeted hashtags for this platform: {platform}.
            Input Post Content / Topic:
            "{content_text}"
            
            Platform rules:
            - Platform: {platform}
            - Guidelines: Return 5 to 12 hashtags that maximize organic reach.
            - Format: ONLY return the hashtags separated by spaces.
            
            Generated Hashtags:
            """
        elif comment_type == "blog_article":
            prompt = f"""
            Write a structured, high-quality blog post or article based on this topic/outline:
            "{content_text}"
            
            Target Platform: {platform} (Optimize the context and format for the audience of this platform)
            Tone Style: {comment_style}
            Length constraint: {length_prompt} (Aim for detailed structure)
            {personality_prompt}
            
            Formatting Guidelines:
            - Include a catchy, SEO-friendly article title.
            - Organize the body with clean subheadings, bullet points where appropriate, and structured paragraphs.
            - End with a summary of key takeaways and a concluding thought.
            - Do not include any introductory AI conversational phrases.
            
            Generated Blog Post:
            """
        elif comment_type == "social_media_creator":
            prompt = f"""
            Create an engaging, attention-grabbing social media post based on this topic:
            "{content_text}"
            
            Target Platform: {platform}
            Tone Style: {comment_style}
            Platform-specific rules: {platform_rules}
            Length constraint: {length_prompt}
            {personality_prompt}
            
            Guidelines:
            - Write a compelling hook in the first sentence.
            - Use short paragraphs and spacing to make it highly readable.
            - Include a clear call-to-action (CTA) encouraging reader interaction.
            - Automatically format with relevant emojis and 2-4 appropriate hashtags.
            - Do not write introductory AI text.
            
            Generated Social Media Post:
            """
        elif comment_type == "marketing_ad":
            prompt = f"""
            Write persuasive marketing and ad copy for:
            "{content_text}"
            
            Target Platform: {platform}
            Tone Style: {comment_style}
            {personality_prompt}
            
            Guidelines:
            - Structure the copy using a proven copywriting framework like AIDA (Attention, Interest, Desire, Action) or PAS (Problem, Agitate, Solve).
            - Include a hook/headline, benefits-driven body text, and a strong, urgent call-to-action (CTA).
            - Keep it punchy, high-converting, and clear.
            - Do not include introductory conversational text.
            
            Generated Marketing Ad Copy:
            """
        elif comment_type == "email":
            prompt = f"""
            Write a professional marketing, sales, or transactional email template based on the following topic or brief:
            "{content_text}"
            
            Tone Style: {comment_style}
            Target Audience Platform context: {platform}
            {personality_prompt}
            
            Guidelines:
            - Start with a compelling, high-open-rate Subject Line.
            - Include a clear, personalized greeting and professional sign-off.
            - Keep the body concise, direct, and action-oriented.
            - Conclude with a singular, clear call-to-action (CTA).
            - Do not write introductory AI chat text.
            
            Generated Email:
            """
        elif comment_type == "newsletter":
            prompt = f"""
            Write a structured, high-quality newsletter edition based on the following topic, brief, or search results:
            "{content_text}"
            
            Tone Style: {comment_style}
            Target Audience Platform context: {platform}
            {personality_prompt}
            
            Guidelines:
            - Today's date is {current_date_full}. Under no circumstances should you generate any news items, publications, or dates in the future (after {current_date_full}).
            - Start with a compelling Newsletter Title / Headline.
            - Include a brief introductory section outlining what is inside.
            - Use section headers and bullet points to break down key insights, news, or updates.
            - Base all news items ENTIRELY on the provided real-time search results. Ensure every single news item includes its source name (e.g. [TechCrunch], [Reuters]) and its date (June 2026).
            - DO NOT output old/outdated news (e.g., Google launching Bard in 2023, Microsoft acquiring Nuance in 2021/2022).
            - If no recent or specific June 2026 news details are present in the search results, state that clearly instead of generating outdated or generic info.
            - Conclude with a warm wrap-up, feedback prompt, and call-to-action (CTA).
            - Do not write introductory AI chat text.
            
            Generated Newsletter:
            """
        elif comment_type == "product_description":
            prompt = f"""
            Write an appealing and persuasive product description based on these details:
            "{content_text}"
            
            Tone Style: {comment_style}
            Target Platform context: {platform}
            {personality_prompt}
            
            Guidelines:
            - Highlight key benefits first, focusing on solving the target customer's pain points.
            - Outline the technical specifications or main features in a neat bulleted list.
            - Use sensory and emotionally resonant vocabulary.
            - Keep the output clean, starting directly with the description without introductory AI phrases.
            
            Generated Product Description:
            """
        elif comment_type == "website_content":
            prompt = f"""
            Write high-converting website content (such as landing page hero copy, service descriptions, or about sections) based on the following details:
            "{content_text}"
            
            Tone Style: {comment_style}
            {personality_prompt}
            
            Guidelines:
            - Write a clear, attention-grabbing Hero Headline.
            - Provide a persuasive sub-headline that details the value proposition.
            - Write 2-3 body sections highlighting services, features, or benefits.
            - Include a placeholder button/CTA text.
            - Format directly with markdown tags.
            
            Generated Website Copy:
            """
        elif comment_type == "video_script":
            prompt = f"""
            Write a detailed video script and outline for a short or long-form video on this topic:
            "{content_text}"
            
            Target Platform: {platform} (Optimize formatting for {platform} video style)
            Tone Style: {comment_style}
            {personality_prompt}
            
            Guidelines:
            - Include a powerful 5-second Hook to grab attention.
            - Structure with Visual Cues / Scene Directions in brackets [like this] alongside spoken Dialog.
            - Include key talking points, transitional steps, and a final call-to-action / Outro.
            - Do not include introductory conversational AI phrases.
            
            Generated Video Script:
            """
        elif comment_type == "seo_content":
            prompt = f"""
            Write search-engine optimized (SEO) content based on this topic/keyword brief:
            "{content_text}"
            
            Tone Style: {comment_style}
            {personality_prompt}
            
            Guidelines:
            - Include proposed Meta Title and Meta Description at the top.
            - List 3-5 recommended LSI/Target Keywords.
            - Provide an SEO-friendly article body structured with clear H1, H2, and H3 headers.
            - Integrate keywords naturally within the text.
            
            Generated SEO Content:
            """
        elif comment_type == "rewriter_summarizer":
            prompt = f"""
            Summarize and rewrite the following text:
            "{content_text}"
            
            Tone Style for rewrite: {comment_style}
            {personality_prompt}
            
            Guidelines:
            - First, output a "### Summary" section containing 3-5 concise bullet points of key takeaways.
            - Second, output a "### Polished Rewrite" section containing a professionally rewritten version of the text that enhances flow, vocabulary, and clarity.
            - Do not include introductory conversational AI text.
            
            Generated Summary & Rewrite:
            """
        elif comment_type == "text_enhancer":
            prompt = f"""
            Enhance and optimize the following text for grammar, style, clarity, and overall engagement:
            "{content_text}"
            
            Tone Style: {comment_style}
            {personality_prompt}
            
            Guidelines:
            - Correct any passive voice, phrasing errors, or grammatical issues.
            - Output the polished and enhanced version directly.
            - Below the enhanced text, add a short list of "Key Enhancements Made" detailing what was improved (e.g. readability, vocabulary, structure).
            
            Generated Enhanced Text:
            """
        else:
            # Standard Comment Prompt
            prompt = f"""
            Write a {comment_style} comment about this {platform} post/content:
            "{content_text}"
            
            Platform-specific requirements:
            - Platform: {platform}
            - Rules: {platform_rules}
            - Length constraint: {length_prompt}
            - Comment Style: {comment_style}
            
            {personality_prompt}
            
            Writing guidelines:
            - Must sound like a genuine, authentic human engaging in a natural conversation.
            - NEVER output introductory text like "Here is your comment:" or "As an AI..."
            - Do not use hashtags or emojis unless absolutely necessary for the platform style (e.g. TikTok, Instagram can have 1 relevant emoji, LinkedIn should have none).
            - Focus on value and realism.
            
            Generated Comment:
            """
        
        start_time = time.time()
        comment_text_output = self._call_ollama(prompt, temperature)
        generation_time_ms = int((time.time() - start_time) * 1000)
        
        if not comment_text_output:
            raise ValueError("LLM generation failed. Please verify your Ollama connection or GROQ_API_KEY configuration.")
            
        # 5. Advanced Features & Quality Metrics
        humanization_score = self._calculate_humanization_score(comment_text_output)
        spam_detected = self._detect_spam(comment_text_output)
        duplicate_detected = self._detect_duplicate(db, user.id, comment_text_output)
        quality_rating = self._evaluate_quality(comment_text_output, platform, comment_style)
        
        # 6. Save in history
        history_log = history_service.create_history_log(
            db=db,
            user_id=user.id,
            persona_id=persona.id if persona else None,
            platform=platform,
            input_content=original_content_text,
            output_content=comment_text_output,
            style=comment_style,
            comment_type=comment_type,
            humanization_score=humanization_score,
            spam_detected=spam_detected,
            duplicate_detected=duplicate_detected,
            quality_rating=quality_rating,
            generation_time_ms=generation_time_ms
        )
        
        # 7. Increment SaaS usage
        self.increment_saas_usage(db, user, 1)
        
        return {
            "id": history_log.id,
            "text": comment_text_output,
            "platform": platform,
            "style": comment_style,
            "comment_type": comment_type,
            "humanization_score": humanization_score,
            "spam_detected": spam_detected,
            "duplicate_detected": duplicate_detected,
            "quality_rating": quality_rating,
            "generation_time_ms": generation_time_ms
        }

    def generate_reply(
        self,
        db: Session,
        user: User,
        platform: str,
        original_comment: str,
        reply_style: str = "friendly",
        persona_id: Optional[int] = None,
        temperature: float = 0.7,
        comment_length: str = "short"
    ) -> Dict[str, Any]:
        """Generate a response reply to an existing comment"""
        if not self.check_saas_limit(db, user, 1):
            raise ValueError(f"SaaS Plan Limit Exceeded! {user.plan} plan is capped at the monthly quota limit.")
            
        persona = None
        if persona_id:
            persona = persona_service.get_persona(db, persona_id, user.id)
            
        plat_details = platform_service.get_platform_details(platform)
        platform_rules = plat_details["rules"]
        personality_prompt = persona_service.build_personality_prompt(persona)
        
        prompt = f"""
        Write a reply to this original comment: "{original_comment}" on {platform}.
        
        Requirements:
        - Tone style: {reply_style}
        - Context rules: {platform_rules}
        - Length constraint: Under 2 short sentences
        {personality_prompt}
        
        Ensure it reads like a natural, spontaneous conversational response. Avoid hashtags, intros, or excessive punctuation.
        
        Reply:
        """
        
        start_time = time.time()
        reply_output = self._call_ollama(prompt, temperature)
        generation_time_ms = int((time.time() - start_time) * 1000)
        
        if not reply_output:
            raise ValueError("LLM reply generation failed. Please verify your Ollama connection or GROQ_API_KEY configuration.")
            
        humanization_score = self._calculate_humanization_score(reply_output)
        spam_detected = self._detect_spam(reply_output)
        duplicate_detected = self._detect_duplicate(db, user.id, reply_output)
        quality_rating = self._evaluate_quality(reply_output, platform, reply_style)
        
        history_log = history_service.create_history_log(
            db=db,
            user_id=user.id,
            persona_id=persona.id if persona else None,
            platform=platform,
            input_content=original_comment,
            output_content=reply_output,
            style=reply_style,
            comment_type="reply",
            humanization_score=humanization_score,
            spam_detected=spam_detected,
            duplicate_detected=duplicate_detected,
            quality_rating=quality_rating,
            generation_time_ms=generation_time_ms
        )
        
        self.increment_saas_usage(db, user, 1)
        
        return {
            "id": history_log.id,
            "text": reply_output,
            "platform": platform,
            "style": reply_style,
            "comment_type": "reply",
            "humanization_score": humanization_score,
            "spam_detected": spam_detected,
            "duplicate_detected": duplicate_detected,
            "quality_rating": quality_rating,
            "generation_time_ms": generation_time_ms
        }

    def _call_ollama(self, prompt: str, temperature: float) -> Optional[str]:
        """Wrapper around requests call to local Ollama server (commented out for Groq routing test)"""
        # Read the GROQ_API_KEY from backend config settings
        api_key = settings.GROQ_API_KEY
        
        if not api_key or "replace_me" in api_key:
            logger.warning("GROQ_API_KEY is not configured in .env. Falling back to local Ollama.")
            # Fallback to standard Ollama if no valid Groq key is found
            if not ollama_service.is_available():
                logger.warning("Ollama API is unavailable. Proceeding to fallback.")
                return None
                
            model = ollama_service.get_default_model()
            try:
                response = requests.post(
                    f"{ollama_service.ollama_url}/api/generate",
                    json={
                        "model": model,
                        "prompt": prompt,
                        "stream": False,
                        "options": {"temperature": temperature, "top_p": 0.9},
                    },
                    timeout=90,
                )
                if response.status_code == 200:
                    result = response.json()
                    text = result.get("response", "").strip()
                    if text.startswith('"') and text.endswith('"'):
                        text = text[1:-1]
                    return text
                return None
            except Exception as e:
                logger.error(f"Ollama call failed: {e}")
                return None

        # Route to Groq API
        import time
        from datetime import datetime
        now = datetime.now()
        current_date_full = now.strftime("%B %d, %Y")
        
        system_content = (
            f"You are a helpful assistant. Today is {current_date_full}. "
            f"Under no circumstances should you generate any news events, publications, or dates in the future (after {current_date_full})."
        )
        
        max_retries = 5
        backoff = 2.0
        for attempt in range(max_retries):
            try:
                logger.info(f"Routing LLM query to Groq Cloud API (attempt {attempt+1}/{max_retries})...")
                response = requests.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "llama-3.1-8b-instant",
                        "messages": [
                            {"role": "system", "content": system_content},
                            {"role": "user", "content": prompt}
                        ],
                        "temperature": temperature,
                        "max_tokens": 800
                    },
                    timeout=30
                )
                if response.status_code == 200:
                    result = response.json()
                    text = result["choices"][0]["message"]["content"].strip()
                    if text.startswith('"') and text.endswith('"'):
                        text = text[1:-1]
                    return text
                elif response.status_code == 429:
                    logger.warning(f"Groq API rate limited (429). Retrying in {backoff}s...")
                    time.sleep(backoff)
                    backoff *= 2
                else:
                    logger.error(f"Groq API returned error {response.status_code}: {response.text}")
                    time.sleep(backoff)
                    backoff *= 2
            except Exception as e:
                logger.error(f"Groq API call failed: {e}")
                time.sleep(backoff)
                backoff *= 2
                
        # Fallback to local Ollama if Groq failed after all retries
        logger.warning("Groq Cloud API failed after all retries. Attempting fallback to local Ollama...")
        if ollama_service.is_available():
            model = ollama_service.get_default_model()
            try:
                response = requests.post(
                    f"{ollama_service.ollama_url}/api/generate",
                    json={
                        "model": model,
                        "prompt": prompt,
                        "stream": False,
                        "options": {"temperature": temperature, "top_p": 0.9},
                    },
                    timeout=90,
                )
                if response.status_code == 200:
                    result = response.json()
                    text = result.get("response", "").strip()
                    if text.startswith('"') and text.endswith('"'):
                        text = text[1:-1]
                    return text
            except Exception as e:
                logger.error(f"Ollama fallback fallback failed: {e}")
                
        return None

    def _calculate_humanization_score(self, text: str) -> int:
        """Returns 1-100 human likeness score based on sentence complexity and phrasing"""
        if not text:
            return 0
        score = 80  # Base line
        
        # Penalize typical AI framing
        ai_markers = ["as an ai", "delve", "furthermore", "in conclusion", "here is", "notable", "vital", "tapestry"]
        lower_text = text.lower()
        for marker in ai_markers:
            if marker in lower_text:
                score -= 10
                
        # Length adjustments: natural human comments are short and concise
        words = text.split()
        num_words = len(words)
        if 5 <= num_words <= 30:
            score += 10
        elif num_words > 60:
            score -= 5
            
        # Punctuation variation
        punctuations = [".", ",", "!", "?"]
        count_punc = sum(1 for char in text if char in punctuations)
        if count_punc >= 1:
            score += 5
            
        return max(30, min(99, score))

    def _detect_spam(self, text: str) -> bool:
        """Scan comment for repetitive bot-like or promotional phrases"""
        spam_keywords = ["buy now", "click here", "subscribe", "follow me", "free money", "dm me", "check my bio", "check out my profile", "whatsapp me"]
        lower_text = text.lower()
        
        # Check spam keywords
        if any(kw in lower_text for kw in spam_keywords):
            return True
            
        # Too short or just symbols
        if len(text) < 4:
            return True
            
        return False

    def _detect_duplicate(self, db: Session, user_id: int, text: str) -> bool:
        """Verify if user has generated exact or highly similar comment recently"""
        recent_logs = db.query(CommentHistory).filter(
            CommentHistory.user_id == user_id
        ).order_by(CommentHistory.created_at.desc()).limit(15).all()
        
        cleaned_target = "".join(text.lower().split())
        for log in recent_logs:
            cleaned_log = "".join(log.output_content.lower().split())
            if cleaned_target == cleaned_log:
                return True
        return False

    def _evaluate_quality(self, text: str, platform: str, style: str) -> int:
        """Return 1-5 quality rating based on platform fit and vocabulary diversity"""
        if not text or len(text) < 10:
            return 1
            
        score = 4
        
        # Platform-specific length constraints check
        length = len(text)
        if platform == "Twitter/X" and length > 280:
            score -= 1
        if platform == "LinkedIn" and length < 25:
            score -= 1
            
        # Style check: Expert or Technical style should have diverse vocabulary
        if style in ["Expert", "Technical"] and len(set(text.split())) < 8:
            score -= 1
            
        return max(1, min(5, score))

    def _generate_fallback_comment(self, platform: str, style: str, persona: Optional[Persona]) -> str:
        """Fallback natural engagement generator in case Ollama service is unavailable"""
        p_name = persona.name if persona else "Expert"
        interest_ref = f" regarding {persona.interests[0]}" if persona and persona.interests else ""
        
        fallbacks = {
            "LinkedIn": {
                "Professional": [
                    "Excellent analysis. This really underlines the core challenges we face in operational scalability. Thanks for sharing!",
                    "Great breakdown! The shift toward structured frameworks is proving highly efficient for operations.",
                    "Very relevant points. Scalability is definitely key when organizing teams at this stage."
                ],
                "Expert": [
                    f"Completely agree. In my experience{interest_ref}, aligning technology solutions with clear KPIs is critical for sustainable growth.",
                    f"Very well put. Industry focus{interest_ref} needs solid strategic parameters to survive competitive pressure."
                ],
                "Curious": [
                    "Insightful post. What metrics would you prioritize when validating the initial performance in this setup?",
                    "Great write-up. Have you considered looking at performance bounds under high concurrent load?"
                ],
                "Supportive": [
                    "Spot on! Really appreciate you putting this together. It is a highly relevant point for current startup teams.",
                    "Fully support this perspective. Appreciate the detailed analysis!"
                ]
            },
            "Twitter/X": {
                "Funny": [
                    "Classic. Honestly thought I was the only one dealing with this today. 😂",
                    "So true. Had to reread this twice because it hit too close to home. 😅"
                ],
                "Expert": [
                    "True. The shift to lightweight architecture is proving itself in production weekly.",
                    "Indeed. Micro-benchmarks are showing huge improvements here."
                ],
                "Contrarian": [
                    "Interesting, but I think this misses the impact of long-term maintainability.",
                    "Not sure I completely agree. Maintenance costs usually dwarf initial dev speed."
                ],
                "Friendly": [
                    "Love this perspective, keep sharing!",
                    "Awesome insight, thanks for sharing!"
                ]
            },
            "Reddit": {
                "Technical": [
                    "This is a solid summary. Typically, connection limits and socket exhaustion are what kill you first under high concurrency in these scenarios.",
                    "Good point. I'd also look closely at thread-pool starvation under sudden spikes."
                ],
                "Curious": [
                    "Could you elaborate on why you'd choose this over standard Pub/Sub setups in a scaling microservice environment?",
                    "How does this hold up when you add strict database isolation level guarantees?"
                ],
                "Contrarian": [
                    "I'm not convinced this scales. The memory overhead alone makes it a bottleneck for small VMs.",
                    "Honestly, this feels over-engineered for most average loads."
                ]
            }
        }
        
        import random
        plat_fallbacks = fallbacks.get(platform, fallbacks["LinkedIn"])
        style_list = plat_fallbacks.get(style, ["This is incredibly insightful. Thanks for breaking this down and sharing your experience!"])
        
        if isinstance(style_list, str):
            style_list = [style_list]
            
        selected = random.choice(style_list)
        # Add a tiny random modifier to ensure uniqueness
        modifier = random.choice(["", " Truly inspiring.", " Appreciate the share!", " Well done."])
        return f"{selected}{modifier}"

    def _generate_fallback_reply(self, original_comment: str, style: str, persona: Optional[Persona]) -> str:
        """Fallback comment responder if Ollama is unavailable"""
        import random
        replies = [
            "Thanks for sharing your thoughts! Totally agree with what you've mentioned here.",
            "Great perspective. Thanks for adding value to this discussion!",
            "Appreciate the feedback! That is a very valid point you have raised."
        ]
        return random.choice(replies)

comment_service = CommentService()

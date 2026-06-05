from typing import Dict, Any, List

class PlatformService:
    def __init__(self):
        self.platforms = {
            "LinkedIn": {
                "name": "LinkedIn",
                "rules": "Professional, executive tone. Focus on networking, thought leadership, industry growth, and constructive business insights. Avoid emojis and slang. Keep it between 40-100 words.",
                "max_length": 800,
                "default_style": "Professional",
                "styles": ["Professional", "Expert", "Supportive", "Curious"]
            },
            "Twitter/X": {
                "name": "Twitter/X",
                "rules": "Short, snappy, conversational, and direct. Ideal for fast-paced scrolling. Can contain light wit. Strictly under 200 characters (max 2-3 short sentences). Avoid hashtags.",
                "max_length": 280,
                "default_style": "Funny",
                "styles": ["Friendly", "Funny", "Contrarian", "Expert", "Curious"]
            },
            "YouTube": {
                "name": "YouTube",
                "rules": "Viewer style. Enthusiastic, direct, and appreciative. Talk like a viewer engaging with the creator. Under 25 words.",
                "max_length": 150,
                "default_style": "Supportive",
                "styles": ["Supportive", "Friendly", "Curious", "Funny"]
            },
            "Instagram": {
                "name": "Instagram",
                "rules": "Casual, friendly, highly conversational. Visually suggestive and energetic. Max 2 sentences, under 30 words. No hashtags.",
                "max_length": 200,
                "default_style": "Friendly",
                "styles": ["Friendly", "Funny", "Supportive", "Motivational"]
            },
            "Facebook": {
                "name": "Facebook",
                "rules": "Community-focused, warm, and interactive. Sounds like a friend or neighbor. Keep it casual and helpful. Max 60 words.",
                "max_length": 400,
                "default_style": "Friendly",
                "styles": ["Friendly", "Supportive", "Motivational", "Curious"]
            },
            "Reddit": {
                "name": "Reddit",
                "rules": "Discussion style. Informative, objective, analytical, sometimes slightly contrarian or expert-oriented. Sounds like a typical Redditor who values details, reasoning, or tech facts. Avoid generic praises. Keep it between 50-150 words.",
                "max_length": 1000,
                "default_style": "Technical",
                "styles": ["Technical", "Contrarian", "Expert", "Curious"]
            },
            "TikTok": {
                "name": "TikTok",
                "rules": "Youth style. High energy, casual, hype-based, and extremely short. Max 10-15 words. Avoid formal words entirely.",
                "max_length": 100,
                "default_style": "Motivational",
                "styles": ["Friendly", "Motivational", "Funny"]
            },
            "Threads": {
                "name": "Threads",
                "rules": "Casual, thoughts-on-the-fly, friendly. Feels like a stream of consciousness. Short (max 40 words).",
                "max_length": 300,
                "default_style": "Friendly",
                "styles": ["Friendly", "Funny", "Curious", "Supportive"]
            },
            "Quora": {
                "name": "Quora",
                "rules": "Expert advice, helpful, educational, and detailed. Sounds like a structured, mini-answer. Under 150 words.",
                "max_length": 1200,
                "default_style": "Expert",
                "styles": ["Expert", "Technical", "Supportive", "Curious"]
            },
            "Discord": {
                "name": "Discord",
                "rules": "Community chat member style. Short, friendly, helpful, uses gamer or developer-friendly terminology where appropriate. Under 30 words.",
                "max_length": 200,
                "default_style": "Friendly",
                "styles": ["Friendly", "Supportive", "Technical", "Funny"]
            },
            "Telegram": {
                "name": "Telegram",
                "rules": "Fast, direct group chat reply. Short, casual, and highly focused. Under 20 words.",
                "max_length": 150,
                "default_style": "Friendly",
                "styles": ["Friendly", "Supportive", "Funny"]
            }
        }

    def get_supported_platforms(self) -> List[Dict[str, Any]]:
        return list(self.platforms.values())

    def get_platform_details(self, platform_name: str) -> Dict[str, Any]:
        return self.platforms.get(platform_name, {
            "name": platform_name,
            "rules": "Generic natural comment rules. Authentic, engaging, and relevant. Under 50 words.",
            "max_length": 500,
            "default_style": "Friendly",
            "styles": ["Friendly", "Professional", "Expert", "Funny", "Motivational", "Curious", "Technical", "Supportive", "Contrarian"]
        })

platform_service = PlatformService()

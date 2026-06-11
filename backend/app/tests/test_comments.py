from unittest.mock import patch
from app.services.comment_service import comment_service

@patch.object(comment_service, "_call_ollama", return_value="Fake generated test content.")
def test_persona_and_generation_flow(mock_call, client):
    # 1. Register & Login
    client.post(
        "/api/auth/register",
        json={"email": "commenter@example.com", "password": "password123", "full_name": "Comment Tester"}
    )
    login_res = client.post(
        "/api/auth/login",
        json={"username": "commenter@example.com", "password": "password123"}
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Create Persona
    persona_res = client.post(
        "/api/personas",
        json={
            "name": "Tech Founder",
            "interests": ["AI", "Startups", "SaaS"],
            "traits": ["Analytical", "Professional", "Curious"]
        },
        headers=headers
    )
    assert persona_res.status_code == 201
    persona = persona_res.json()
    assert persona["name"] == "Tech Founder"
    persona_id = persona["id"]
    
    # 3. Generate Comment
    comment_res = client.post(
        "/api/comments/generate",
        json={
            "platform": "LinkedIn",
            "content_text": "We just raised our seed round of $2M to build the next generation of databases.",
            "comment_style": "Professional",
            "persona_id": persona_id,
            "temperature": 0.8,
            "generate_count": 1,
            "comment_length": "medium"
        },
        headers=headers
    )
    assert comment_res.status_code == 200
    comment = comment_res.json()
    assert comment["platform"] == "LinkedIn"
    assert comment["style"] == "Professional"
    assert "text" in comment
    assert comment["humanization_score"] >= 30
    
    # 4. Generate Reply
    reply_res = client.post(
        "/api/comments/reply",
        json={
            "platform": "Twitter/X",
            "original_comment": "This product is amazing! How long did it take to build?",
            "reply_style": "friendly",
            "persona_id": persona_id,
            "temperature": 0.7,
            "comment_length": "short"
        },
        headers=headers
    )
    assert reply_res.status_code == 200
    reply = reply_res.json()
    assert reply["platform"] == "Twitter/X"
    assert reply["style"] == "friendly"
    assert "text" in reply
    
    # 5. Fetch Templates
    templates_res = client.get("/api/templates", headers=headers)
    assert templates_res.status_code == 200
    templates = templates_res.json()
    assert len(templates) > 0  # Seeding triggers automatically
    
    # 6. Fetch Settings
    settings_res = client.get("/api/settings", headers=headers)
    assert settings_res.status_code == 200
    set_data = settings_res.json()
    assert set_data["saas_plan"] == "Free"
    
    # 7. Fetch History
    history_res = client.get("/api/history", headers=headers)
    assert history_res.status_code == 200
    logs = history_res.json()
    assert len(logs) >= 2  # Has the generated comment and reply
    
    # 8. Export History CSV
    csv_res = client.get("/api/history/export/csv", headers=headers)
    assert csv_res.status_code == 200
    assert "text/csv" in csv_res.headers["content-type"]

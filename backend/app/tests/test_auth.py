def test_register_and_login(client):
    # 1. Register User
    response = client.post(
        "/api/auth/register",
        json={"email": "testuser@example.com", "password": "password123", "full_name": "Test User"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "testuser@example.com"
    assert data["full_name"] == "Test User"
    assert "id" in data
    
    # 2. Login User
    response = client.post(
        "/api/auth/login",
        json={"username": "testuser@example.com", "password": "password123"}
    )
    assert response.status_code == 200
    token_data = response.json()
    assert "access_token" in token_data
    assert "refresh_token" in token_data
    
    # 3. Access current user profile
    headers = {"Authorization": f"Bearer {token_data['access_token']}"}
    response = client.get("/api/users/me", headers=headers)
    assert response.status_code == 200
    me_data = response.json()
    assert me_data["email"] == "testuser@example.com"
    assert me_data["plan"] == "Free"
    
    # 4. Update Profile
    profile_data = {
        "full_name": "Updated Name",
        "email": "testuser@example.com"
    }
    response = client.put("/api/users/me", json=profile_data, headers=headers)
    assert response.status_code == 200
    p_data = response.json()
    assert p_data["full_name"] == "Updated Name"

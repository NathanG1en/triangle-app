import pytest

def test_places_autocomplete(client):
    # Search for "fullsteam"
    res = client.get("/api/v1/places/autocomplete?query=fullsteam")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 1
    assert "Fullsteam" in data[0]["venue_name"]
    assert "Durham" in data[0]["city"]
    assert "image_url" in data[0]

def test_places_resolve_photo(client):
    res = client.get("/api/v1/places/resolve-photo?venue_name=Durham%20Bulls%20Athletic%20Park")
    assert res.status_code == 200
    data = res.json()
    assert "image_url" in data
    assert "http" in data["image_url"]

import urllib.request
import json
import sys

BASE_URL = "http://127.0.0.1:8001"

def run_tests():
    print("--- 1. Testing Standardized /health (Section 9) ---")
    req = urllib.request.urlopen(f"{BASE_URL}/health")
    health = json.loads(req.read().decode())
    print("Health response:", health)
    assert health["status"] == "healthy"
    assert health["service"] == "mineinterview-backend"

    print("\n--- 2. Testing /api/interview/interviewers ---")
    req = urllib.request.urlopen(f"{BASE_URL}/api/interview/interviewers")
    interviewers = json.loads(req.read().decode())
    print(f"Loaded {len(interviewers)} interviewers: {[i['name'] for i in interviewers]}")
    assert len(interviewers) == 4

    print("\n--- 3. Testing Interview Creation (Arjun - Senior Backend) ---")
    create_payload = json.dumps({
        "role": "Senior Distributed Systems Engineer",
        "experience": "Senior",
        "interviewType": "Technical Interview",
        "questionCount": 5,
        "interviewerId": "arjun"
    }).encode("utf-8")

    req = urllib.request.Request(
        f"{BASE_URL}/api/interview/create",
        data=create_payload,
        headers={"Content-Type": "application/json"}
    )
    res = json.loads(urllib.request.urlopen(req).read().decode())
    session_id = res["sessionId"]
    print(f"Created Session ID: {session_id}")
    print(f"Opening Question: {res['openingQuestion'][:70]}...")

    print("\n--- 4. Testing Candidate Answer & NLP + Similarity Analysis ---")
    ans_payload = json.dumps({
        "answerText": "Basically, we migrated our monolithic architecture to FastAPI and Redis cluster with JWT authentication, which cut p99 latency by 45%.",
        "timeTakenSeconds": 30.0
    }).encode("utf-8")

    req = urllib.request.Request(
        f"{BASE_URL}/api/interview/{session_id}/answer",
        data=ans_payload,
        headers={"Content-Type": "application/json"}
    )
    ans_res = json.loads(urllib.request.urlopen(req).read().decode())
    print(f"Q2: {ans_res['question'][:70]}...")
    print(f"Is Follow-Up: {ans_res['isFollowUp']}")
    assert ans_res["isFollowUp"] is True

    print("\n--- 5. Testing Early Completion & Evaluation Pipeline ---")
    req = urllib.request.Request(
        f"{BASE_URL}/api/interview/{session_id}/complete",
        data=b"",
        headers={"Content-Type": "application/json"}
    )
    eval_res = json.loads(urllib.request.urlopen(req).read().decode())
    print(f"Score: {eval_res['overallScore']}/100 | Grade: {eval_res['grade']} | Recommendation: {eval_res['recommendation']}")
    print(f"Deterministic Fillers Detected: {eval_res['speechAnalysis']['fillerWordCount']} (Found: {eval_res['speechAnalysis']['fillerWordsFound']})")
    assert eval_res['speechAnalysis']['fillerWordCount'] >= 1
    assert "basically" in eval_res['speechAnalysis']['fillerWordsFound']

    print(f"STAR Performance Situation: {eval_res['starPerformance']['situationScore']}")
    print(f"Question Reviews: {len(eval_res['questionReviews'])} items evaluated")

    print("\nALL ARCHITECTURAL & NLP PIPELINE TESTS PASSED 100% SUCCESFULLY!")

if __name__ == "__main__":
    run_tests()

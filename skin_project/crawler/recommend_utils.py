def generate_recommend_query(diagnosis: list[str], skin_type: str, sensitivity: str) -> str:
    issues = ", ".join(diagnosis)
    return f"{skin_type} 피부 / 민감도: {sensitivity} / 상태: {issues}"

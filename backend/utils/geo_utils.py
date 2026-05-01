def get_risk_level(prediction):
    if prediction < 0.3:
        return "Low"
    elif prediction < 0.7:
        return "Medium"
    else:
        return "High"
import os
import json
import numpy as np
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.metrics import accuracy_score, mean_squared_error
from sklearn.model_selection import train_test_split

with open('training_samples.json', 'r', encoding='utf-8') as f:
    data = json.load(f)


def extract_features(sample):
    text = f"{sample['category']}: {sample['description']}"
    text_lower = text.lower()
    words = text_lower.split()
    high_words = ['dangerous', 'urgent', 'emergency', 'flooding', 'damage', 'broken']
    med_words = ['concern', 'problem', 'issue', 'repair']
    low_words = ['small', 'minor', 'cosmetic']
    high_count = sum(1 for w in high_words if w in text_lower)
    med_count = sum(1 for w in med_words if w in text_lower)
    low_count = sum(1 for w in low_words if w in text_lower)
    categories = ['Pothole', 'Street Light', 'Water Leak', 'Drainage', 'Sidewalk', 'Traffic Signal', 'Waste']
    category_text = text.split(':')[0].strip()
    category_index = categories.index(category_text) if category_text in categories else -1
    cat_features = [1 if i == category_index else 0 for i in range(len(categories))]
    return np.array([high_count / 10, med_count / 10, low_count / 10, len(words) / 100, len(text) / 500, *cat_features], dtype=float)

X = np.array([extract_features(sample) for sample in data])
y_priority = [sample['correctedPriority'] for sample in data]
y_severity = [sample['correctedSeverity'] for sample in data]
y_risk = [sample['correctedRiskFactor'] for sample in data]

X_train, X_test, y_p_train, y_p_test = train_test_split(X, y_priority, test_size=0.2, random_state=42, stratify=y_priority)
_, _, y_s_train, y_s_test = train_test_split(X, y_severity, test_size=0.2, random_state=42)
_, _, y_r_train, y_r_test = train_test_split(X, y_risk, test_size=0.2, random_state=42)

priority_model = LogisticRegression(multi_class='multinomial', solver='lbfgs', max_iter=1000)
severity_model = LinearRegression()
risk_model = LinearRegression()
priority_model.fit(X_train, y_p_train)
severity_model.fit(X_train, y_s_train)
risk_model.fit(X_train, y_r_train)

os.makedirs('colab_model_artifacts', exist_ok=True)
artifact = {
    'priority': {
        'classes': priority_model.classes_.tolist(),
        'coefficients': priority_model.coef_.tolist(),
        'intercepts': priority_model.intercept_.tolist(),
    },
    'severity': {
        'coefficients': severity_model.coef_.tolist(),
        'intercept': severity_model.intercept_.tolist()[0],
    },
    'risk': {
        'coefficients': risk_model.coef_.tolist(),
        'intercept': risk_model.intercept_.tolist()[0],
    },
}
with open('colab_model_artifacts/model_artifact.json', 'w', encoding='utf-8') as f:
    json.dump(artifact, f, indent=2)

print('Priority accuracy:', round(accuracy_score(y_p_test, priority_model.predict(X_test)), 3))
print('Severity RMSE:', round(mean_squared_error(y_s_test, severity_model.predict(X_test)), 3))
print('Risk RMSE:', round(mean_squared_error(y_r_test, risk_model.predict(X_test)), 3))
print('Artifact written to colab_model_artifacts/model_artifact.json')

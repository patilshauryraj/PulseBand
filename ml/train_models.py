import os
import json
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import joblib

def generate_synthetic_kinematic_dataset(n_samples: int = 1200):
    """
    Generates synthetic accelerometer sliding window feature vectors
    grounded in human physical kinematics for:
    0: RESTING, 1: STATIONARY, 2: WALKING, 3: RUNNING, 4: ACTIVE
    """
    np.random.seed(42)
    classes = ["RESTING", "STATIONARY", "WALKING", "RUNNING", "ACTIVE"]
    n_per_class = n_samples // len(classes)

    X = []
    y = []

    for label_idx, label in enumerate(classes):
        for _ in range(n_per_class):
            if label == "RESTING":
                mean_x = np.random.normal(0.02, 0.02)
                mean_y = np.random.normal(0.01, 0.02)
                mean_z = np.random.normal(0.99, 0.02)
                std_x = np.random.uniform(0.01, 0.03)
                std_y = np.random.uniform(0.01, 0.03)
                std_z = np.random.uniform(0.01, 0.03)
                mag_mean = np.random.normal(0.99, 0.02)
                mag_std = np.random.uniform(0.01, 0.03)
                mag_max = mag_mean + 0.05
                mag_min = mag_mean - 0.05
                energy = 0.98 + np.random.uniform(-0.02, 0.02)
                var = mag_std ** 2
            elif label == "STATIONARY":
                mean_x = np.random.normal(0.08, 0.04)
                mean_y = np.random.normal(-0.06, 0.04)
                mean_z = np.random.normal(0.96, 0.03)
                std_x = np.random.uniform(0.04, 0.07)
                std_y = np.random.uniform(0.04, 0.07)
                std_z = np.random.uniform(0.04, 0.07)
                mag_mean = np.random.normal(0.97, 0.04)
                mag_std = np.random.uniform(0.04, 0.08)
                mag_max = mag_mean + 0.12
                mag_min = mag_mean - 0.12
                energy = 0.95 + np.random.uniform(-0.03, 0.03)
                var = mag_std ** 2
            elif label == "WALKING":
                mean_x = np.random.normal(0.28, 0.08)
                mean_y = np.random.normal(0.35, 0.08)
                mean_z = np.random.normal(1.05, 0.10)
                std_x = np.random.uniform(0.20, 0.40)
                std_y = np.random.uniform(0.25, 0.45)
                std_z = np.random.uniform(0.30, 0.50)
                mag_mean = np.random.normal(1.22, 0.10)
                mag_std = np.random.uniform(0.25, 0.45)
                mag_max = mag_mean + np.random.uniform(0.5, 0.8)
                mag_min = mag_mean - np.random.uniform(0.4, 0.6)
                energy = 1.55 + np.random.uniform(-0.15, 0.15)
                var = mag_std ** 2
            elif label == "RUNNING":
                mean_x = np.random.normal(0.75, 0.15)
                mean_y = np.random.normal(0.85, 0.15)
                mean_z = np.random.normal(1.45, 0.20)
                std_x = np.random.uniform(0.65, 1.10)
                std_y = np.random.uniform(0.75, 1.20)
                std_z = np.random.uniform(0.85, 1.35)
                mag_mean = np.random.normal(2.15, 0.25)
                mag_std = np.random.uniform(0.75, 1.15)
                mag_max = mag_mean + np.random.uniform(1.2, 2.0)
                mag_min = np.random.uniform(0.1, 0.4)
                energy = 4.60 + np.random.uniform(-0.5, 0.5)
                var = mag_std ** 2
            else: # ACTIVE
                mean_x = np.random.normal(0.40, 0.10)
                mean_y = np.random.normal(0.30, 0.10)
                mean_z = np.random.normal(1.10, 0.12)
                std_x = np.random.uniform(0.35, 0.55)
                std_y = np.random.uniform(0.30, 0.50)
                std_z = np.random.uniform(0.35, 0.55)
                mag_mean = np.random.normal(1.35, 0.12)
                mag_std = np.random.uniform(0.35, 0.55)
                mag_max = mag_mean + np.random.uniform(0.6, 1.0)
                mag_min = np.random.uniform(0.3, 0.6)
                energy = 1.95 + np.random.uniform(-0.2, 0.2)
                var = mag_std ** 2

            X.append([mean_x, mean_y, mean_z, std_x, std_y, std_z, mag_mean, mag_std, mag_max, mag_min, energy, var])
            y.append(label_idx)

    return np.array(X), np.array(y), classes

def main():
    print("Generating Kinematic Feature Dataset...")
    X, y, classes = generate_synthetic_kinematic_dataset()
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)

    print(f"Training Random Forest Classifier on {len(X_train)} samples...")
    model = RandomForestClassifier(n_estimators=60, max_depth=10, random_state=42)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred, target_names=classes, output_dict=True)
    matrix = confusion_matrix(y_test, y_pred).tolist()

    print(f"\nModel Evaluation Complete. Accuracy: {acc * 100:.2f}%\n")
    print(classification_report(y_test, y_pred, target_names=classes))

    # Save trained model to backend ML directory
    save_dir = os.path.join(os.path.dirname(__file__), "..", "backend", "app", "ml", "saved_models")
    os.makedirs(save_dir, exist_ok=True)
    model_file = os.path.join(save_dir, "activity_rf.joblib")
    joblib.dump(model, model_file)
    print(f"Model serialized and saved to {model_file}")

    # Save metrics metadata
    meta = {
        "model_name": "Activity Classifier (Random Forest)",
        "version": "1.0.0",
        "accuracy": round(acc, 4),
        "classes": classes,
        "classification_report": report,
        "confusion_matrix": matrix
    }
    with open(os.path.join(save_dir, "model_metadata.json"), "w") as f:
        json.dump(meta, f, indent=2)

if __name__ == "__main__":
    main()

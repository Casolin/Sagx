from ortools.sat.python import cp_model
import random

tech_history = {}

def assign_technician(mission):
    print("\n===== NEW ASSIGNMENT REQUEST =====")

    technicians = mission.get("technicians", [])
    required_skills = set(mission.get("requiredSkills", []))

    print("TECH COUNT:", len(technicians))
    print("REQUIRED SKILLS:", required_skills)

    if not technicians:
        return {
            "assignedTechnician": None,
            "scoreUsed": 0
        }

    model = cp_model.CpModel()
    n = len(technicians)

    x = [model.NewBoolVar(f"tech_{i}") for i in range(n)]

    model.Add(sum(x) == 1)

    scores = []

    for i, tech in enumerate(technicians):

        tech_skills = set(tech.get("skills", []))

        skill_match = len(required_skills & tech_skills)

        experience = tech.get("experience", 0)

        current_tasks = tech.get("currentTasks", 0)
        max_tasks = tech.get("maxTasks", 5)
        free_capacity = max_tasks - current_tasks

        availability = 1 if tech.get("availability", True) else 0

        email = tech.get("email", "")
        repeat_penalty = tech_history.get(email, 0)

        score = (
            skill_match * 50 +
            experience * 5 +
            free_capacity * 10 +
            availability * 20 -
            repeat_penalty * 15
        )

        scores.append(int(score))

        print(f"\nTECH {i}: {email}")
        print("skills:", tech_skills)
        print("score:", score)

    model.Maximize(sum(x[i] * scores[i] for i in range(n)))

    solver = cp_model.CpSolver()
    status = solver.Solve(model)

    if status not in [cp_model.OPTIMAL, cp_model.FEASIBLE]:
        chosen = random.choice(technicians)
        print("FALLBACK RANDOM CHOICE")
        return {
            "assignedTechnician": chosen,
            "scoreUsed": 0
        }

    best_index = None

    for i in range(n):
        if solver.Value(x[i]) == 1:
            best_index = i
            break

    chosen = technicians[best_index]

    email = chosen.get("email")
    tech_history[email] = tech_history.get(email, 0) + 1

    print("\nCHOSEN:", email)

    return {
        "assignedTechnician": chosen,
        "scoreUsed": float(scores[best_index])
    }
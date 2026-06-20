# SQLite

## exercises

Catálogo local.

---

## muscle_groups

Catálogo local.

---

## movement_groups

Catálogo local.

---

## equipments

Catálogo local.

---

## exercise_alternatives

Catálogo local.

---

## workouts

Treinos do usuário.

Campos:

- id
- name
- created_at

---

## workout_exercises

Relacionamento.

---

## workout_history

Treinos executados.

Campos:

- id
- workout_id
- started_at
- finished_at

---

## exercise_progress

Histórico de carga.

Campos:

- id
- exercise_id
- weight
- reps
- sets
- created_at

---

## Sincronização

CatalogVersion

version

checksum

Sincronização incremental.

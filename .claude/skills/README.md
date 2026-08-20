# Product & design decisions

Each decision that should outlive a session lives here as a skill: a
directory with a `SKILL.md` carrying `name` and `description` frontmatter.
Claude loads a skill when the `description` matches what it is about to do,
so write the description as *when to use this*, not *what this is*.

Rules of thumb:

- One decision area per skill (voice, layout, a feature's rules).
- Record the decision and the reason. Skip the deliberation.
- When a decision changes, edit the skill in the same commit as the code.
- If a decision is not written down here, it is not a decision yet.

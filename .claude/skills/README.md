# Skills

Product and design decisions live here, one skill per area, so they
survive past the conversation that produced them.

Each skill is a directory with a `SKILL.md`:

```
.claude/skills/
  top-eight/
    SKILL.md
```

`SKILL.md` starts with frontmatter — `name` and a `description` that says
when to load it — then the decisions themselves: what we settled on, and
the reasoning that would have to change for us to revisit it. Keep them
short and specific. Skills are for decisions, not for restating what the
code already says.

Check the relevant skill before building a feature. When a decision
changes, update the skill in the same change.

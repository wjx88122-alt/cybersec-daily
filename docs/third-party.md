# Third-Party Design References

This project uses external design references for inspiration and calibration.

## awesome-design-md

- Repository: [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md)
- Purpose in this project:
  - reference for `DESIGN.md` structure
  - inspiration for how AI-readable design guidance can be embedded in a repository
  - visual calibration only, not a direct one-to-one product skin
- License: MIT

## How It Is Used Here

`cybersec-daily` does not depend on `awesome-design-md` as a runtime package.

Instead, it uses the repository as a design-reference source and maintains its own project-specific [`DESIGN.md`](../DESIGN.md) tailored to:

- public security news pages
- public AI news pages
- the intelligence command center
- MDR operational views
- executive team / strategy pages

The design guidance in this repository should therefore be treated as:

- adapted
- narrowed to this product
- rewritten for this codebase

and not as a verbatim upstream copy.

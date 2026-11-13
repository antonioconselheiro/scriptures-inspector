# Scriptures Inspector

<img src="public/script.png" alt="Scriptures Inspector logo" width="120">

> Not by strength or force, but by my Spirit, says the Lord of hosts.
>
> — Zechariah 4:6

🔴 🟠 🟡 🟢 🔵 🟣

Scriptures Inspector is a philological tool for studying ancient texts and
expressing their relationship to translations. It associates original-language
segments with lexical values, morphological patterns, custom translations and
interlinear alignments. Color helps readers follow those associations. Lexical
values can describe the effect of a morpheme rather than a literal word-for-word
translation. A custom translation may consequently divide or phrase text
differently while retaining its links to the original.

Projects can combine multiple codices and languages, indicate passages marked
as the Word of God, and define translation variations as small overrides of a
custom translation. Variations can be combined without creating a separate
complete translation for each combination.

Website: https://antonioconselheiro.github.io/scriptures-inspector/

## Linux installation

Install the project's Debian package with your package manager. It registers
`scriptures-inspector` on the system `PATH` and associates `.xenoglosproj` files
with the application. The installed command uses the bundled Electron runtime;
Node.js is not required separately. RPM packaging also configures the command.
Both packages provide `si` as a short alias for `scriptures-inspector`. If
`/usr/bin/si` already belongs to another program, installation reports a
conflict rather than replacing it.

For example, the following commands are equivalent:

```sh
scriptures-inspector list-books --project .
```

```sh
si list-books --project .
```

For development, install the dependencies and use `npm run build:cli` to build
the CLI. It can then be invoked as `node cli/dist/index.mjs ...`. The `open`
command requires the installed launcher. `npm run test:cli` builds and runs the
CLI tests. `npm run build` builds the Linux Debian application package.
The devcontainer also includes `rpmbuild` from Debian's `rpm` package. After
rebuilding the devcontainer, build the web application and create an RPM with:

```sh
npm run build:web
```

Then package the application as an RPM:

```sh
npm run make -- --targets=@electron-forge/maker-rpm
```

The resulting RPM is written under `out/make/rpm/`. Creating a package does
not install it.

## Project and CLI conventions

Commands expect a project directory containing `index.xenoglosproj`.
`--project <directory>` selects that directory; if omitted, the current
directory is used. It is not a recursive search. The examples below use `.`.

Project sources live in `sources/` or in configured repositories. Targets live
in `targets/<target>/<BOOK>.json`. Read operations that require an original
text or its language load the source book and its `_.codex`; configured remote
sources require network access. Metadata and custom-translation commands
accept either the source name or the corresponding full target name in
`--target`. If a source maps to multiple possible targets, use the full target
name; ambiguous choices are rejected. Interlinear reads require the full
interlinear target name. `--book` is a project target book key, such as `GEN`.
Chapter and verse are positive integers.

List commands display tables in a terminal and retain their JSON output when
redirected or piped. Structured read commands print JSON to standard output.
Mutations print JSON describing their result, except `add-variations`, which
prints the new UUID. `read-translation` prints plain text. `read-lexical`
prints JSON when redirected and colored text in a terminal; set `NO_COLOR` to
obtain JSON there too. Errors go to standard error and return a nonzero exit status. Missing
target files are treated as empty targets; malformed JSON and other I/O errors
are reported. Unknown options, targets, books and variation IDs are errors.

Changes are saved to target JSON files via a temporary file and rename. Avoid
editing the same target concurrently in the GUI or another process: there is
no cross-process locking, and a later save can overwrite an earlier one.
Back up projects before bulk edits or cleanup.

## Commands

### Open and discover

Open the project in the graphical application:

```sh
scriptures-inspector open --project .
```

List target books as objects containing their `key` and `name`:

```sh
scriptures-inspector list-books --project .
```

List project structure sources and reference translation sources:

```sh
scriptures-inspector list-sources --project .
```

List targets grouped into `metadata`, `interlinear` and `translation` arrays:

```sh
scriptures-inspector list-targets --project .
```

### Read verse data

Read segment-keyed metadata for a verse by source name. It returns `{}` if no
target metadata is saved:

```sh
scriptures-inspector read-metadata --project . \
  --target hebrew-stuttgartensia --book GEN --chapter 1 --verse 1
```

Read the same metadata using its full target name instead:

```sh
scriptures-inspector read-metadata --project . \
  --target hebrew-stuttgartensia-portuguese-metadata --book GEN --chapter 1 --verse 1
```

Read interlinear verse records, grouped by associated source:

```sh
scriptures-inspector read-interlinear --project . \
  --target greek-septuagint-hebrew-stuttgartensia-interlinear \
  --book GEN --chapter 1 --verse 1
```

Read each original segment's index, morpheme, text and resolved lexical value
using the editor's parser and normalization. In a terminal, colors cycle
through the seven Prismatic colors:

```sh
scriptures-inspector read-lexical --project . \
  --target hebrew-stuttgartensia --book GEN --chapter 1 --verse 1
```

In terminal output, the original segment and its lexical value share a color.
An empty lexical value is shown as uncolored `<empty>` without a morpheme label.
Redirected JSON preserves the empty string and the segment's morpheme.

### Pending lexicals

List every pending lexical field in a chapter for one source or metadata
target:

```sh
si list-pending-lexicals --project . --target geez-mashafa-qeddus \
  --book GEN --chapter 1
```

Each row is an occurrence, not a unique dictionary entry: repeated segments
are listed separately in source order. The table gives a one-based pending
number, verse, zero-based word and verse-wide segment indexes, original
segment, normalized dictionary key, parsed morpheme and resolved lexical
rule. As in the editor, a field is pending when its resolved value is empty
or contains only whitespace. The rule can differ from the parsed morpheme
when the editor falls back to a root value. The command uses the selected
target's source chapter; query other codices separately.

Find the first pending occurrence, or the next occurrence after an anchor:

```sh
si next-pending-lexical --project . --target geez-mashafa-qeddus \
  --book GEN --chapter 1
```

```sh
si next-pending-lexical --project . --target geez-mashafa-qeddus \
  --book GEN --chapter 1 --verse 2 --segment 12
```

Find the previous pending occurrence, or the last one if no anchor is given:

```sh
si previous-pending-lexical --project . --target geez-mashafa-qeddus \
  --book GEN --chapter 1 --verse 2 --segment 12
```

Navigation is stateless: `--verse` and `--segment` must be supplied together
and identify an existing segment, even if it is no longer pending. It wraps at
the chapter boundaries. Terminal output shows the position, total and whether
it wrapped. Redirected output is a JSON object with `total`, `position`,
`wrapped` and `item`; when no fields are pending, `position` is `0` and `item`
is `null`. The list command returns a JSON array when redirected. To fill a
field, pass its `segment` or `key` and `lexicalRule` to `set-lexical`.

### Word of God and verse cleanup

Use the zero-based segment indexes returned by `read-lexical` to mark one or
more original segments. Multiple indexes are comma-separated; all indexes are
validated before the target is saved:

```sh
si set-word-of-god --project . --target hebrew-stuttgartensia \
  --book GEN --chapter 1 --verse 1 --segments 0,1
```

Remove the Word of God mark from selected segments without removing their
other metadata:

```sh
si remove-word-of-god --project . --target hebrew-stuttgartensia \
  --book GEN --chapter 1 --verse 1 --segments 0,1
```

Remove all Word of God marks from the verse while retaining other metadata:

```sh
si clean-word-of-god --project . --target hebrew-stuttgartensia \
  --book GEN --chapter 1 --verse 1
```

Clear lexical entries for segments occurring in the verse. These are
book-level dictionary entries, so the removal affects their occurrences
throughout the book:

```sh
si clean-verse-lexical --project . --target hebrew-stuttgartensia \
  --book GEN --chapter 1 --verse 1
```

Clear links for one interlinear origin and verse. The origin is a key returned
by `read-interlinear`; other origins and verses are not changed:

```sh
si clean-interlinear --project . \
  --target greek-septuagint-hebrew-stuttgartensia-interlinear \
  --origin hebrew-stuttgartensia --book GEN --chapter 1 --verse 1
```

Clear a verse's saved custom translation, its segment metadata and its
verse-level variation overrides; book-level variation definitions remain:

```sh
si clean-translation --project . --target hebrew-stuttgartensia \
  --book GEN --chapter 1 --verse 1
```

Clear only the custom translation's interlinear links for the verse:

```sh
si clean-translation-interlinear --project . --target hebrew-stuttgartensia \
  --book GEN --chapter 1 --verse 1
```

Clear selected variation overrides for a verse without deleting the
book-level variation definitions:

```sh
si clean-translation-variation --project . --target hebrew-stuttgartensia \
  --book GEN --chapter 1 --verse 1 --variations UUID1,UUID2
```

### Custom translations and variations

List available variations as `{id, name}` entries:

```sh
scriptures-inspector list-variations --project . --target hebrew-stuttgartensia --book GEN
```

Create a variation and print its generated UUID:

```sh
scriptures-inspector add-variations "My variation" --project . --target hebrew-stuttgartensia --book GEN
```

Remove the specified variation definitions and their verse-level overrides.
All IDs are validated before saving:

```sh
scriptures-inspector remove-variations --project . --target hebrew-stuttgartensia --book GEN \
  --variations UUID1,UUID2
```

Read the saved custom translation for a verse, without variations:

```sh
scriptures-inspector read-translation --project . --target hebrew-stuttgartensia \
  --book GEN --chapter 1 --verse 1
```

Read the saved custom translation with selected variations applied in order.
For each segment, the last selected nonempty override wins:

```sh
scriptures-inspector read-translation --project . --target hebrew-stuttgartensia \
  --book GEN --chapter 1 --verse 1 --variations UUID1,UUID2
```

`read-translation` reads the saved custom translation, not a reference
translation, and does not create or derive an unsaved translation. Unknown
variation IDs and missing translation verses are errors.

### Patterns and lexicals

Pattern types are `prefix`, `suffix` and `lexeme`; lexical types are `root`,
`prefix` and `suffix`. Keys are normalized using the project's language
configuration.

List the book's prefix, suffix and lexeme patterns:

```sh
scriptures-inspector list-patterns --project . --target hebrew-stuttgartensia --book GEN
```

Add a prefix pattern. Adding an existing pattern is idempotent:

```sh
scriptures-inspector set-pattern "על" prefix --project . --target hebrew-stuttgartensia --book GEN
```

Remove the specified prefix pattern:

```sh
scriptures-inspector remove-pattern "על" prefix --project . --target hebrew-stuttgartensia --book GEN
```

List all lexical entries for the book:

```sh
scriptures-inspector list-lexicals --project . --target hebrew-stuttgartensia --book GEN
```

Get a lexical entry's normalized key and stored values:

```sh
scriptures-inspector get-lexical "ברא" --project . --target hebrew-stuttgartensia --book GEN
```

Set the root lexical value for a segment:

```sh
scriptures-inspector set-lexical "ברא" root "criar" --project . --target hebrew-stuttgartensia --book GEN
```

Remove a root lexical value. Following the editor's rule, a prefix or suffix
value becomes the root value if present; otherwise the entry is deleted.
Removing a prefix or suffix deletes only that property:

```sh
scriptures-inspector remove-lexical "ברא" root --project . --target hebrew-stuttgartensia --book GEN
```

Remove unused lexical keys by applying the editor's segmentation to the
**whole source book**, and return the removed keys. This operation is
destructive:

```sh
scriptures-inspector clean-unused-lexical --project . --target hebrew-stuttgartensia --book GEN
```

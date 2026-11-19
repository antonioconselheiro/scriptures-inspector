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

In the translation editor, right-click a **scriptures** selector in a custom
translation to fill associations sequentially or move/return them from that
position to the right. These actions leave word-span sizes unchanged. Selecting
the empty option clears only that segment's association. Sequential filling
asks before overwriting existing associations.

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
CLI tests. `npm run build` (or `npm run build:lnx`) builds the standard Linux
Debian application package without the **Reload**, **Force Reload**, and
**Toggle Developer Tools** menu options. Use `npm run build:debug` to build a
package with those debugging options enabled.
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

## Current Preview

Open **Preview Current** from the editor to view the current chapter in the
Holy Viewer. Its settings let you choose custom translation variations in
order: choose `overwrite` or `merge` beside the variation selector before
adding each variation, remove variations from their tags, or drag tags to
change their order. The last nonempty `overwrite` determines each span's
main text; all nonempty `merge` alternatives appear in parentheses after
it, separated by semicolons. If no overwrite applies, the original text
remains. Each tag displays its mode. Existing configurations with a global
mode retain that mode for previously selected variations. Associated original,
interlinear and translation segments are underlined together while hovered or
keyboard-focused.

Holy Viewer settings are stored in the project-root `.scriptures-inspector`
file and loaded again when the preview opens. The file is separate from the
application's project data and preserves other settings stored there.
The preview also includes the editor's book/chapter/verse navigation toolbox;
changing books or chapters stays in the preview, and choosing a verse scrolls
to it or selects it when it is outside the configured passage.

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
prints the new UUID. `read-translation` and `read-all-translations` show
colored source and translation lines in a terminal and structured JSON when
redirected. This replaces the earlier plain-text-only `read-translation`
output; scripts should read the `custom` line's `pieces` from the JSON.
`read-lexical`
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

Show the available commands, their arguments and options without opening a
project:

```sh
si help
```

Show help for one command:

```sh
si help set-translation-size
```

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

Translation commands accept a translation target or its source in `--target`.
Spans and source segment indexes start at zero. Use the listing commands to
discover indexes and IDs before editing. A span's `size` is measured in
JavaScript UTF-16 code units, not bytes or visual characters; changing a size
also changes where later spans start. Existing variation overrides refer to
span indexes and are not automatically moved when text or sizes change.

Derive a verse from lexical values using the editor's **All** operation. This
overwrites the verse text and span metadata (including scripture links and
Word of God overrides); existing verse variation overrides and book-level
variation definitions remain and may need to be reviewed:

```sh
si derivate-translation-from-lexical --project . --target hebrew-stuttgartensia \
  --book GEN --chapter 1 --verse 1
```

Replace the verse text. Existing metadata and variation overrides remain for
nonempty text; an empty string instead clears the verse including its metadata
and verse-level variation overrides, like the editor:

```sh
si set-translation "No princípio criou Divos." --project . --target hebrew-stuttgartensia \
  --book GEN --chapter 1 --verse 1
```

List the current translation spans, their zero-based indexes, sizes, scripture
values and explicit Word of God overrides. A final span without metadata has
`size: null` in JSON:

```sh
si list-translation-spans --project . --target hebrew-stuttgartensia \
  --book GEN --chapter 1 --verse 1
```

List the selectable source segments and their normalized serialized scripture
values for the verse:

```sh
si list-scriptures --project . --target hebrew-stuttgartensia \
  --book GEN --chapter 1 --verse 1
```

Set a span's positive size. A final unconfigured span can be configured this
way before assigning its association or Word of God override:

```sh
si set-translation-size --project . --target hebrew-stuttgartensia \
  --book GEN --chapter 1 --verse 1 --span 0 --size 2
```

Remove a configured span, equivalent to setting its size to zero and
confirming removal in the editor. The text is retained; later span indexes
shift, but existing variation overrides are not reindexed:

```sh
si remove-translation-span --project . --target hebrew-stuttgartensia \
  --book GEN --chapter 1 --verse 1 --span 0
```

Associate a span with a value from `list-scriptures`. Use `--scripture none`
to remove its association:

```sh
si set-translation-scripture --project . --target hebrew-stuttgartensia \
  --book GEN --chapter 1 --verse 1 --span 0 --scripture '0-ב'
```

Mark one configured translation span as Word of God:

```sh
si set-translation-word-of-god --project . --target hebrew-stuttgartensia \
  --book GEN --chapter 1 --verse 1 --span 0
```

Remove its explicit override:

```sh
si remove-translation-word-of-god --project . --target hebrew-stuttgartensia \
  --book GEN --chapter 1 --verse 1 --span 0
```

Removing an override does not remove Word of God status inherited from
original or related source metadata. `list-translation-spans` reports the
explicit override, not the effective inherited status.

Display the source, saved custom translation and every individual variation
with their associative Prismatic colors on a terminal. `NO_COLOR` disables
ANSI colors. Redirected output is JSON: each line has `id`, `name` and
`pieces`, each piece has `text` and `color` (0 means unassociated; 1–7 are
the Prismatic colors). Variations without overrides display the base text:

```sh
si read-all-translations --project . --target hebrew-stuttgartensia \
  --book GEN --chapter 1 --verse 1
```

Explicitly select the same default Prismatic mode:

```sh
si read-all-translations --project . --target hebrew-stuttgartensia \
  --book GEN --chapter 1 --verse 1 --mode prismatic
```

Display Word of God in red instead of Prismatic colors:

```sh
si read-all-translations --project . --target hebrew-stuttgartensia \
  --book GEN --chapter 1 --verse 1 --mode wordOfGod
```

In this mode, source segments inherit marks through related interlinear
sources. A translation span is marked when its associated source word or a
related source is marked, or when the span itself has a Word of God override.
The same span marking applies to its variation text; variation entries store
replacement text, not separate Word of God flags. Unassociated editorial
content can be marked directly with `set-translation-word-of-god`.
`NO_COLOR` disables red output as well. Redirected JSON retains the Prismatic
`color` field and adds a boolean `wordOfGod` to every piece, including
unmarked pieces and separators. Default and explicit `prismatic` JSON retain
the original output shape.

For a translation source used under multiple interlinear parents, select its
immediate parent with `--origin`; links are followed through the structure to
the original source. Unmapped segments are uncolored:

```sh
si read-all-translations --project . --target geez-mashafa-qeddus \
  --origin greek-septuagint --book GEN --chapter 1 --verse 1
```

List available variations as `{id, name}` entries:

```sh
scriptures-inspector list-variations --project . --target hebrew-stuttgartensia --book GEN
```

Create a variation and print its generated UUID:

```sh
scriptures-inspector add-variations "My variation" --project . --target hebrew-stuttgartensia --book GEN
```

Rename an existing variation without removing its overrides:

```sh
si rename-variation "New name" --project . --target hebrew-stuttgartensia \
  --book GEN --variation UUID
```

Set the value of one span in one variation. A single space is a valid override;
an empty value removes the override:

```sh
si set-variation-value "Elohim" --project . --target hebrew-stuttgartensia \
  --book GEN --chapter 1 --verse 1 --span 3 --variation UUID
```

Remove one override, restoring the base span for that variation:

```sh
si remove-variation-value --project . --target hebrew-stuttgartensia \
  --book GEN --chapter 1 --verse 1 --span 3 --variation UUID
```

List the editor's previously used suggestions for a span's associated
scripture and variation:

```sh
si list-variation-suggestions --project . --target hebrew-stuttgartensia \
  --book GEN --chapter 1 --verse 1 --span 3 --variation UUID
```

Remove the specified variation definitions and their verse-level overrides.
All IDs are validated before saving:

```sh
scriptures-inspector remove-variations --project . --target hebrew-stuttgartensia --book GEN \
  --variations UUID1,UUID2
```

Display the original and the saved custom translation for a verse, without
variations. The default color mode is Prismatic:

```sh
scriptures-inspector read-translation --project . --target hebrew-stuttgartensia \
  --book GEN --chapter 1 --verse 1
```

Display the original and the saved custom translation with selected variations
applied in order. Supply multiple IDs as one comma-separated `--variations`
value; for each span, the last selected nonempty override wins:

```sh
scriptures-inspector read-translation --project . --target hebrew-stuttgartensia \
  --book GEN --chapter 1 --verse 1 --variations UUID1,UUID2
```

Show the base text together with all selected nonempty alternatives in
parentheses, in selection order:

```sh
si read-translation --project . --target hebrew-stuttgartensia \
  --book GEN --chapter 1 --verse 1 --variations UUID1,UUID2 --variation-mode merge
```

The default `--variation-mode overwrite` preserves the usual behavior. In
`merge` mode, each span is displayed as `base (alternative 1; alternative 2)`;
unassociated text retains its usual color behavior.

To choose a different mode for each variation, append `:overwrite` or `:merge`
to its ID. For example, from the repository root with the Bible project:

```sh
si read-translation --project ./projects/bible --target hebrew-stuttgartensia \
  --book GEN --chapter 1 --verse 1 \
  --variations 1389d4a7-688a-473d-89bb-372656f9a73b:overwrite,fc5ca031-196a-4f7e-aca5-808369ed3b93:merge
```

For the saved values in that project this displays `Deus (Elohim)` for the
corresponding span. As in the Holy Viewer, the last nonempty `overwrite` sets
the main text and all nonempty `merge` alternatives appear afterward in their
selected order, regardless of their positions relative to the overwrites. IDs
without a suffix use `--variation-mode`, or `overwrite` if it is omitted.
Each ID can appear only once. The mode suffix is specific to
`read-translation`; other commands continue to accept plain variation IDs.

Display the combination with Word of God in red instead of Prismatic colors:

```sh
si read-translation --project . --target hebrew-stuttgartensia \
  --book GEN --chapter 1 --verse 1 --mode wordOfGod --variations UUID1,UUID2
```

`read-translation` supports the same `--mode`, `--origin`, `NO_COLOR` and
piece fields as `read-all-translations`. In redirected JSON it returns two
lines: `original` and `custom`, the latter containing the combined selected
variations. In Word of God mode pieces also have a `wordOfGod` boolean.
The optional `--variation-mode overwrite|merge` sets the default for selected
variation IDs without a mode suffix; `overwrite` is the default.

`read-translation` reads the saved custom translation, not a reference
translation, and does not create or derive an unsaved translation. Unknown
variation IDs and missing translation verses are errors.

### Patterns and lexicals

Global pattern types are `prefix`, `suffix` and `lexeme`; `distinct` patterns
associate an exact normalized segment with a segment-specific `prefix` and/or
`suffix`. Distinct rules are applied to an otherwise unresolved root segment
after global patterns, so they do not classify the same morpheme in other
words. Lexical types are `root`, `prefix` and `suffix`. Matching uses the
project's language normalization.

List the book's global and distinct patterns:

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

Define א as a prefix only for the segment אֵחָבֵֽא. The final argument is the
morpheme to split from that segment; use `prefix` or `suffix` to choose which
side it occupies:

```sh
scriptures-inspector set-distinct-pattern "אֵחָבֵֽא" prefix "א" \
  --project . --target hebrew-stuttgartensia --book GEN
```

Remove that segment-specific prefix definition:

```sh
scriptures-inspector remove-distinct-pattern "אֵחָבֵֽא" prefix \
  --project . --target hebrew-stuttgartensia --book GEN
```

The equivalent context-menu action is **Define אֵ as prefix for אֵחָבֵֽא**.
The suffix variant uses `suffix` in the CLI and the corresponding context-menu
action. `list-patterns` includes distinct definitions in its JSON output.

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

# Portable DIP intent

This repository carries a dependency-free Node 20+ helper. Review repository code and trust before executing it. It makes no network requests and does not install DIP. Run commands from the project root:

`node .dip/tools/portable.mjs list`

`node .dip/tools/portable.mjs get --id ID`

`node .dip/tools/portable.mjs create --title "Future idea"`

`node .dip/tools/portable.mjs plan --id ID --text "Short plan"`

`node .dip/tools/portable.mjs checkpoint --id ID --summary "Completed and remaining work" --next "Next step"`

For long plans write Markdown once and link it with installed DIP when available. Portable update/resolve accepts --patch JSON. Node child-process argument arrays avoid shell JSON quoting problems. Reads are paginated; --all includes completed/discussion records. Recorded verified status is historical, never a fresh assessment. Conflicting histories require explicit resolve; corrupt histories stop writes. Strict projects require installed ownership and cannot use this fallback.

Portable intent events merge through Git and the normal runtime. Live coordination, automatic hooks, Markdown linking and configured verification require installed DIP (Node 24+). Portable writes have no leases; collaborators must coordinate independently. Use at your own responsibility.

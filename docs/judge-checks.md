# Judge Checks

This page gives a short, reproducible check for each important product claim.

| Check | Steps | Expected result | Evidence |
|------|-------|-----------------|----------|
| Start the app | Follow [README.md](../README.md#run-locally) and open `http://localhost:5173` | Optimizer page loads | README run instructions |
| Check API health | Open `http://localhost:3001/api/health` | `{"ok":true}` is returned | `backend/src/app.ts` |
| Natural-language input | Use `2 kg rice`, `1 dozen eggs`, `2 litres cooking oil`, and `1 kg flour` | Items are parsed and a basket is returned | `backend/tests/optimizer.test.ts` |
| Roman Urdu aliases | Replace rice with `2 kg chawal` and eggs with `1 dozen anday` | Canonical rice and egg matches are found | `backend/tests/optimizer.test.ts` |
| Whole packages | Request `2 kg rice` | The result covers the request using complete packages | `backend/src/lib/optimizer.ts` |
| Budget status | Set a budget below the calculated total | The result is labelled over budget | `backend/tests/optimizer.test.ts` |
| Excluded brand | Enter a catalogue brand in **Exclude brands** | That brand is not selected | `backend/tests/optimizer.test.ts` |
| Product links | Click a selected product name | The source product page opens in a new tab | Frontend basket rendering |
| Product images | Optimize the example basket | Selected items show catalogue images when available, with icon fallbacks | Frontend basket rendering |
| Store logos | Inspect store summary and Catalogue links | Al-Fatah and Metro Mart logos are visible with accessible alt text | Frontend assets |
| Catalogue | Click **Catalogue** | Paginated product cards show prices, availability, links, and images | `frontend/my-react-app/src/App.tsx` |
| Automated verification | Run the commands in [docs/testing.md](testing.md#how-to-run-tests) | 16 backend tests pass, TypeScript passes, lint has no errors, and frontend builds | `docs/testing.md` |

## Known judge limitations

- There is no public deployment URL in this repository; the judge must run the local services unless a deployment is provided separately.
- Metro Mart is a comparison reference in the UI, not a live crawled catalogue.
- Catalogue prices and availability come from the cached snapshot and may be stale.

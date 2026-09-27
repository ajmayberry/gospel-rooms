// Inlines src/ into one self-contained index.html: one file, one request.
import { readFileSync, writeFileSync } from 'node:fs';
const src = f => readFileSync(new URL('./src/' + f, import.meta.url), 'utf8');
const js = ['core.js', 'raster.js', 'iso.js', 'figure.js', 'scenes.js', 'app.js'].map(src).join('\n');
// the scene list, read straight out of scenes.js so it can't drift
const list = [...src('scenes.js').matchAll(/title: '([^']+(?:’[^']*)?)', cite: '([^']+)'/g)].map((m, i) => `  ${String(i + 1).padStart(2)}. ${m[1].padEnd(26)} ${m[2]}`).join('\n');
const head = src('head.html').replace('<!doctype html>', `<!doctype html>\n<!--\n  THE GOSPEL IN TWENTY-FIVE ROOMS — isometric risograph, four spot inks, canvas only.\n\n${list}\n-->`);
const hint = `<script>setTimeout(()=>{const h=document.getElementById('hint');if(h)h.style.opacity=0},7000)</script>`;
const html = head + `<script>\n${js}\n</script>\n${hint}\n</body>\n</html>\n`;
writeFileSync(new URL('./index.html', import.meta.url), html);
console.log('index.html', (html.length / 1024).toFixed(1) + ' KB');

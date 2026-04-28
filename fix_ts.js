const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    for (const [from, to] of replacements) {
        if ((from instanceof RegExp && from.test(content)) || (typeof from === 'string' && content.includes(from))) {
            content = content.replace(from, to);
            changed = true;
        }
    }
    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed ${filePath}`);
    }
}

function walkSync(dir, callback) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filepath = path.join(dir, file);
        if (fs.statSync(filepath).isDirectory()) {
            walkSync(filepath, callback);
        } else if (filepath.endsWith('.ts') || filepath.endsWith('.tsx')) {
            callback(filepath);
        }
    }
}

const replacements = [
    [/preco: /g, 'precoVenda: '],
    [/imovel\.preco/g, 'imovel.precoVenda'],
    [/i\.preco/g, 'i.precoVenda'],
    [/clientPropertyInterest/g, 'interesseClienteImovel'],
    [/clientPreference/g, 'preferenciaCliente'],
    [/nome: "credentials"/g, 'name: "credentials"'],
    [/titulo: "Prime Realty CRM"/g, 'title: "Prime Realty CRM"'],
    [/session\.user\.id/g, 'session?.user?.id || ""'],
    [/tag: /g, 'etiqueta: ']
];

walkSync('./src', file => replaceInFile(file, replacements));
walkSync('./prisma', file => replaceInFile(file, replacements));

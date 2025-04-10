const fs = require('fs');
const path = require('path');

const modelsPath = path.join(__dirname, '../models');
const outputPath = path.join(__dirname, 'schema.dbml');

const typeMap = {
    String: 'varchar',
    Number: 'integer',
    Boolean: 'boolean',
    Date: 'timestamp',
    ObjectId: 'ObjectId',
    Mixed: 'json',
};

let tables = '';
let refs = [];

fs.readdirSync(modelsPath).forEach(file => {
    const modelPath = path.join(modelsPath, file);
    const model = require(modelPath);
    const modelName = file.replace('.js', '');

    if (model.schema) {
        tables += `Table ${modelName.toLocaleLowerCase()} {\n`;
        tables += `  _id ObjectId [primary key]\n`;

        Object.entries(model.schema.obj).forEach(([key, value]) => {
            let fieldType = 'varchar';

            if (typeof value === 'object' && value !== null) {
                if (value.type?.name) {
                    fieldType = typeMap[value.type.name] || value.type.name;
                } else if (value.constructor?.name) {
                    fieldType = typeMap[value.constructor.name] || value.constructor.name;
                }

                tables += `  ${key} ${fieldType}\n`;

                if (value.ref) {
                    refs.push(`Ref: ${modelName.toLowerCase()}.${key} > ${value.ref.toLowerCase()}._id`);
                }
            } else {
                fieldType = typeMap[typeof value] || 'varchar';
                tables += `  ${key} ${fieldType}\n`;
            }
        });

        tables += '}\n\n';
    }
});

const dbmlOutput = '// DBML Export for dbdiagram.io\n\n' + tables + refs.join('\n');

fs.writeFileSync(outputPath, dbmlOutput);
console.log(`✅ DBML schema saved to: ${outputPath}`);

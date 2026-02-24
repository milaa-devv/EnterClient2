import fs from "fs";
import { Client } from "pg";
import { parse } from "pg-connection-string";

const dbUrl = process.env.SUPABASE_DB_URL;
if (!dbUrl) {
  console.error("Falta SUPABASE_DB_URL en env.");
  process.exit(1);
}

const cfg = parse(dbUrl);
const client = new Client({
  host: cfg.host,
  port: cfg.port ? Number(cfg.port) : 5432,
  user: cfg.user,
  password: cfg.password,
  database: cfg.database || "postgres",
  ssl: { rejectUnauthorized: false },
});

function tsType(pgType) {
  const t = pgType.toLowerCase();
  if (["int2", "int4", "int8", "numeric", "float4", "float8"].includes(t)) return "number";
  if (["bool"].includes(t)) return "boolean";
  if (["json", "jsonb"].includes(t)) return "any";
  return "string";
}

(async () => {
  await client.connect();

  // Trae columnas del schema public
  const { rows } = await client.query(`
    select table_name, column_name, is_nullable, data_type, udt_name
    from information_schema.columns
    where table_schema='public'
    order by table_name, ordinal_position;
  `);

  const tables = {};
  for (const r of rows) {
    const table = r.table_name;
    if (!tables[table]) tables[table] = [];
    const type = r.data_type === "USER-DEFINED" ? r.udt_name : r.udt_name;
    tables[table].push({
      col: r.column_name,
      nullable: r.is_nullable === "YES",
      type,
    });
  }

  // Genera un Database mínimo pero suficiente (Row/Insert/Update)
  let out = `export interface Database {\n  public: {\n    Tables: {\n`;

  for (const [table, cols] of Object.entries(tables)) {
    out += `      ${table}: {\n`;
    out += `        Row: {\n`;
    for (const c of cols) {
      out += `          ${c.col}: ${tsType(c.type)}${c.nullable ? " | null" : ""}\n`;
    }
    out += `        }\n`;

    // Insert: requiere campos no-null sin default (no lo inferimos aquí), así que lo dejamos opcional excepto PK típicas
    out += `        Insert: {\n`;
    for (const c of cols) {
      out += `          ${c.col}?: ${tsType(c.type)}${c.nullable ? " | null" : ""}\n`;
    }
    out += `        }\n`;

    out += `        Update: {\n`;
    for (const c of cols) {
      out += `          ${c.col}?: ${tsType(c.type)}${c.nullable ? " | null" : ""}\n`;
    }
    out += `        }\n`;
    out += `      }\n`;
  }

  out += `    }\n    Views: { [_ in never]: never }\n    Functions: { [_ in never]: never }\n    Enums: { [_ in never]: never }\n  }\n}\n`;

  fs.mkdirSync("src/types", { recursive: true });
  fs.writeFileSync("src/types/database.types.ts", out, "utf8");

  await client.end();
  console.log("✅ Generados tipos en src/types/database.types.ts");
})();
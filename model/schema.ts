import { appSchema, tableSchema } from "@nozbe/watermelondb";

export default appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: "trips",
      columns: [
        { name: "name", type: "string" },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
      ],
    }),
    tableSchema({
      name: "stops",
      columns: [
        { name: "name", type: "string" },
        { name: "date", type: "string" },
        { name: "trip_id", type: "string", isIndexed: true },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
      ],
    }),
    tableSchema({
      name: "accommodations",
      columns: [
        { name: "name", type: "string" },
        { name: "price", type: "number" },
        { name: "currency", type: "string" },
        { name: "check_in", type: "string" },
        { name: "check_out", type: "string" },
        { name: "stop_id", type: "string", isIndexed: true },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
      ],
    }),
    tableSchema({
      name: "transports",
      columns: [
        { name: "name", type: "string" },
        { name: "type", type: "string" },
        { name: "price", type: "number" },
        { name: "currency", type: "string" },
        { name: "date", type: "string" },
        { name: "stop_id", type: "string", isIndexed: true },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
      ],
    }),
  ],
});

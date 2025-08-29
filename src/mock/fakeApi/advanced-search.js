export default function AdvancedSearch(server, apiPrefix) {
  server.post(`${apiPrefix}/advanced-search`, (schema, { requestBody }) => {
    const data = [
      { label: "آیتم 1", value: "item-1" },
      { label: "آیتم 2", value: "item-2" },
      { label: "آیتم 3", value: "item-3" },
      { label: "آیتم 4", value: "item-4" },
      { label: "آیتم 5", value: "item-5" },
      { label: "آیتم 6", value: "item-6" },
      { label: "آیتم 7", value: "item-7" },
      { label: "آیتم 8", value: "item-8" },
      { label: "آیتم 9", value: "item-9" },
      { label: "آیتم 10", value: "item-10" },
    ];

    return { message: "ok", data };
  });
}

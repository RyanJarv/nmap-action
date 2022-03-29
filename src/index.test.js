const run = require("./index");


describe("run main", () => {
  
  test("it runs", async () => {
    const resp = await run('-Pn -sT -F scanme.nmap.org', 'ryanjarv/nmap-docker', process.cwd(), 'output', 'nmapvuln.json');
    expect(resp).toBeUndefined();
  });

});

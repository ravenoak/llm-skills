export const version = "0.1.0";

async function main(): Promise<void> {
  // Real commands added in later tasks.
  console.log(`skillsmith ${version}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  void main();
}

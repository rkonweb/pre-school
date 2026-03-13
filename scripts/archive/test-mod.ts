import { moderateContent } from "./src/lib/ai-moderation";
async function main() {
  const res = await moderateContent("My number is 9876543210 and you are an idiot.");
  console.log(res);
}
main().catch(console.error);

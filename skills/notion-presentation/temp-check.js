const title = "这是一个非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常长的背景描述，超过...";
console.log(`Title: "${title}"`);
console.log(`Length: ${title.length}`);
console.log(`First 47 chars: "${title.substring(0, 47)}"`);
console.log(`Expected: "${title.substring(0, 47)}..."`);

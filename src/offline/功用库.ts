export function 取文件名(文件全路径: string): string {
	let 拆分路径 = 文件全路径.split("/");
	return 拆分路径.length > 1 ? 拆分路径[拆分路径.length - 1] : 文件全路径;
}

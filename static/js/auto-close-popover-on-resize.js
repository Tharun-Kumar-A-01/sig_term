const menu = document.querySelector("[popover]");
const query = matchMedia("(min-width: 684px)");

query.addEventListener("change", (event) => {
    if (event.matches && menu.checkVisibility()) {
        menu.hidePopover();
    }
})

let patname = window.location.pathname;
let paths = patname.split("/");
console.log(paths)
let path_el = document.getElementById("current-path");
for (path in paths) {
	if (paths[path] === "") {
		paths.splice(path, 1)
	}
}
if (paths.length > 3) {
	path_el.innerHTML = ".../";
	for (let i = paths.length - 3; i < paths.length; i++) {
		if (paths[i] === "") continue;
		path_el.innerHTML += `<a class="bc-path-element" href="/${paths.slice(0, i + 1).join("/")}">${paths[i]}</a>/`
	}
} else {
	path_el.innerHTML = "~/";
	for (let i = 0; i < paths.length; i++) {
		if (paths[i] === "") continue;
		path_el.innerHTML += `<a class="bc-path-element" href="/${paths.slice(0, i + 1).join("/")}">${paths[i]}</a>/`
	}
}
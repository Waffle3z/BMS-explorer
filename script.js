let selectedButton = null;
let settings = {
	notation: "BMS",
	indentation: "expansion",
	simplify: false,
	aliases: true
};

function selectButton(button) {
	if (selectedButton) {
		selectedButton.classList.remove("selected");
	}
	selectedButton = button;
	selectedButton.classList.add("selected");
	selectedButton.focus();
}

function getChildren(button) {
	return button.nextElementSibling;
}
function getButtonParent(button) {
	if (button != document.getElementById("root")) {
		return button.parentElement.parentElement.previousElementSibling;
	}
}
function getButtonFirstChild(button) {
	if (!(children = getChildren(button))) return;
	if (!(li = children.firstElementChild)) return;
	return li.firstElementChild;
}
function getButtonLastChild(button) {
	if (!(children = getChildren(button))) return;
	if (!(li = children.lastElementChild)) return;
	return li.firstElementChild;
}
function getButtonNextSibling(button) {
	if (button == document.getElementById("root")) return;
	let sibling = button.parentElement.nextElementSibling;
	if (sibling) return sibling.firstElementChild;
}
function getButtonPreviousSibling(button) {
	if (button == document.getElementById("root")) return;
	let sibling = button.parentElement.previousElementSibling;
	if (sibling) return sibling.firstElementChild;
}

function expandstr(str, n) {
	if (str == "Root") {
		return PMSexpandroot(n);
	}
	return PMSexpand(stringToMatrix(str), n);
}

function unexpand(button) {
	const children = getChildren(button);
	if (!children) return;
	if (children.classList.contains("expanded")) {
		children.removeChild(children.firstElementChild);
		if (!children.firstElementChild) {
			children.classList.toggle("expanded");
			button.classList.remove("button-expanded");
			button.classList.add("button-collapsed");
		}
		return true;
	}
}

function expand(button) {
	const children = getChildren(button);
	if (!children) return;
	if (!children.classList.contains("expanded")) {
		children.classList.toggle("expanded");
		button.classList.remove("button-collapsed");
		button.classList.add("button-expanded");
	}
	let str = button.getAttribute("value") || "Root";
	
	let index = 0;
	if (matrixIsSuccessor(expandstr(str, 0)) && !matrixIsSuccessor(expandstr(str, 1))) {
		index++; // avoid cases where a limit of limits expands into a successor at index 0
	}
	let compare = nextButtonDown(button);
	if (compare) {
		let compareMatrix = stringToMatrix(compare.getAttribute("value"));
		let limit = 0;
		while (matrixLessOrEqual(expandstr(str, index), compareMatrix)) {
			index++;
			limit++;
			if (limit == 10) break;
		}
	}
	
	let matrix = expandstr(str, index);
	return createButton(matrixToString(matrix), children, matrixIsSuccessor(matrix));
}

function indentli(li, index) {
	if (settings.indentation == "expansion") {
		li.style.marginLeft = `calc(40px * ${index} - 40px)`;
	} else if (settings.indentation == "noindent") {
		li.style.marginLeft = `-40px`;
	} else if (settings.indentation == "FS") {
		li.style.marginLeft = ``;
	}
}

function convertToNotation(value) {
	let matrix = stringToMatrix(value);
	if (settings.notation == "AMS") {
		matrix = PMStoAMS(matrix);
	} else if (settings.notation == "BMS") {
		matrix = PMStoBMS(matrix);
	}
	
	let str;
	if (settings.notation == "0Y") {
		matrix = PMSto0Y(matrix);
		str = matrix.join(",");
	} else {
		str = matrixToString(settings.simplify ? matrixSimplify(matrix) : matrix);
	}
	
	if (settings.aliases) {
		let alias = findAlias(value);
		if (alias) {
			str += " = " + alias;
		}
	}
	
	return str;
}

function createButton(value, parent, isLeaf) {
	const childItem = document.createElement("li");
	indentli(childItem, parent.children.length);
	const button = document.createElement("button");
	childItem.appendChild(button);
	button.classList.add("node");
	if (!isLeaf) {
		button.classList.add("button-collapsed");
		const childrenList = document.createElement("ul");
		childrenList.classList.add("children");
		childItem.appendChild(childrenList);
	}
	button.setAttribute("value", value);
	button.innerText = convertToNotation(value);
	parent.prepend(childItem);
	return button;
}

function nextButtonDown(button) {
	if (firstChild = getButtonFirstChild(button)) {
		return firstChild;
	} else if (nextSibling = getButtonNextSibling(button)) {
		return nextSibling;
	} else if (parentButton = getButtonParent(button)) {
		while (parentButton && !getButtonNextSibling(parentButton)) {
			parentButton = getButtonParent(parentButton);
		}
		if (parentButton && (parentSibling = getButtonNextSibling(parentButton))) {
			return parentSibling;
		}
	}
}

function moveSelectionDown() {
	if (nextButton = nextButtonDown(selectedButton)) {
		selectButton(nextButton);
	}
}

function moveSelectionUp() {
	if (selection = getButtonPreviousSibling(selectedButton)) {
		while (getButtonLastChild(selection)) {
			selection = getButtonLastChild(selection);
		}
		selectButton(selection);
	} else if (parentButton = getButtonParent(selectedButton)) {
		selectButton(parentButton);
	}
}

function refreshTerms() {
	let stack = [document.getElementById("root")];
	while (stack.length > 0) {
		let button = stack.pop();
		let current = getButtonLastChild(button);
		while (current) {
			current.innerText = convertToNotation(current.getAttribute("value"));
			stack.push(current);
			current = getButtonPreviousSibling(current);
		}
	}
}

function refreshIndentation() {
	let stack = [document.getElementById("root")];
	while (stack.length > 0) {
		let button = stack.pop();
		let current = getButtonLastChild(button);
		let index = 0;
		while (current) {
			indentli(current.parentElement, index);
			stack.push(current);
			index++
			current = getButtonPreviousSibling(current);
		}
	}
}

function setNotation(newNotation) {
	settings.notation = newNotation;
	refreshTerms();
}

function setIndentation(newIndentation) {
	settings.indentation = newIndentation;
	refreshIndentation();
}

document.addEventListener("DOMContentLoaded", () => {
	const container = document.getElementById("tree");
	selectButton(document.getElementById("root"));
	
	container.addEventListener("click", (event) => {
		const targetNode = event.target.closest(".node");
		if (targetNode) {
			event.preventDefault();
			expand(targetNode);
			selectButton(targetNode);
		}
	});

	container.addEventListener("keydown", (event) => {
		if (event.key === "ArrowDown") {
			event.preventDefault();
			moveSelectionDown();
		} else if (event.key === "ArrowUp") {
			event.preventDefault();
			moveSelectionUp();
		} else if (event.key === "Backspace") {
			event.preventDefault();
			if (!unexpand(selectedButton)) {
				moveSelectionUp();
			}
		} else if (event.key === "Enter") {
			event.preventDefault();
			let button = selectedButton;
			const ms = Date.now();
			for (let i = 0; i < 1000; i++) {
				button = expand(button);
				if (!button) break;
				if (Date.now() - ms > 10) break;
			}
		} else if (event.key === " ") {
			event.preventDefault();
			expand(selectedButton);
		}
	});
	
	document.querySelectorAll('input[name="notation"]').forEach(function(radioInput) {
		radioInput.addEventListener('change', function() {
			setNotation(radioInput.value);
		});
	});
	document.querySelectorAll('input[name="indentation"]').forEach(function(radioInput) {
		radioInput.addEventListener('change', function() {
			setIndentation(radioInput.value);
		});
	});
	const simplifyCheckbox = document.getElementById("simplify");
	simplifyCheckbox.addEventListener('change', function() {
		settings.simplify = simplifyCheckbox.checked;
		refreshTerms();
	});
	const aliasesCheckbox = document.getElementById("aliases");
	aliasesCheckbox.addEventListener('change', function() {
		settings.aliases = aliasesCheckbox.checked;
		refreshTerms();
	});
});

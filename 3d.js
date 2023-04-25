"use strict";
window.RLQ = window.RLQ || [];
window.RLQ.push(() => {
	let mousePos = { x: 0, y: 0 };
	function faceToCursor() {
		document
			.querySelectorAll(".mw-parser-output > div > div")
			.forEach((ele) => {
				const distanceX =
					(ele.offsetLeft +
						ele.offsetWidth / 2 -
						window.pageXOffset -
						mousePos.x) *
					0.025;
				const distanceY =
					(ele.offsetTop +
						ele.offsetHeight / 2 -
						window.pageYOffset -
						mousePos.y) *
					0.025;

				ele.style.transform = `perspective(1000px) rotateX(${distanceY}deg) rotateY(${-distanceX}deg)`;
				ele.style.boxShadow = `${distanceX}px ${distanceY}px 20px rgba(0,0,20,.25)`;
			});
	}
	document.addEventListener("scroll", faceToCursor);
	document.addEventListener("mousemove", (e) => {
		mousePos = { x: e.clientX, y: e.clientY };
		faceToCursor(e);
	});
});

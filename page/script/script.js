document.addEventListener('DOMContentLoaded', function () {
	const factionTabsContainer = document.getElementById('faction-tabs');
	const tabContentsContainer = document.getElementById('tab-contents');
	// Size of cards - rest is calculated just based on this.
	const maxWidth = 450;
	const maxHeight = 650;

	//Size of boxes for combat cards.
	const textBackgroundSize = 759;
	const textBottomBarHeight = 18;
	const textBottomBarWidth = 454;

	const titleFontSize = maxHeight * 0.05;
	const marginWidth = maxWidth * 0.0578;
	const maxTextWidth = maxWidth - 2 * marginWidth;

	// MENU SECTION 
	fetch('factions/file_names.json')
		.then(response => response.json())
		.then(data => {
			const { factions, files } = data;

			factions.folder.forEach((faction, index) => {
				// Create faction tab header
				const factionTabHeader = document.createElement('div');

				factionTabHeader.textContent = factions.name[index];
				factionTabHeader.classList.add('tab-header');
				if (index === 0) factionTabHeader.classList.add('active');
				factionTabHeader.dataset.faction = faction;
				factionTabsContainer.appendChild(factionTabHeader);

				// Create faction tab content container
				const factionTabContent = document.createElement('div');
				factionTabContent.id = `tab-${faction}`;
				factionTabContent.classList.add('tab-content');
				if (index === 0) factionTabContent.classList.add('active');
				tabContentsContainer.appendChild(factionTabContent);

				// Create sub-tabs for combat, orders, events
				const subTabs = document.createElement('div');
				subTabs.classList.add('sub-tabs');
				['combat', 'orders', 'events'].forEach((category, catIndex) => {
					const subTabHeader = document.createElement('div');
					subTabHeader.textContent = category.charAt(0).toUpperCase() + category.slice(1);
					subTabHeader.classList.add('sub-tab-header');
					subTabHeader.dataset.category = category;
					subTabHeader.dataset.faction = faction;
					if (catIndex === 0) subTabHeader.classList.add('active');
					subTabs.appendChild(subTabHeader);
				});
				factionTabContent.appendChild(subTabs);

				const subTabContents = document.createElement('div');
				subTabContents.classList.add('sub-tab-contents');

				['combat', 'orders', 'events'].forEach((category, catIndex) => {
					const subTabContent = document.createElement('div');
					subTabContent.id = `sub-tab-${faction}-${category}`;
					subTabContent.classList.add('sub-tab-content');
					if (catIndex === 0) subTabContent.classList.add('active');
					subTabContents.appendChild(subTabContent);

					// Load faction text and images
					fetch(`factions/${faction}/text.json`)
						.then(response => response.json())
						.then(textData => {
							if (category === 'combat') {
								createCombatContent(subTabContent, faction, files, textData);
							} else if (category === 'orders') {
								createOrdersContent(subTabContent, faction, files, textData);
							} else {
								createEventContent(subTabContent, faction, files, textData);
							}

						})
						.catch(error => console.error(`Error loading text data for ${faction}:`, error));
				});
				factionTabContent.appendChild(subTabContents);
			});
			// Add click event listener to faction tabs
			document.querySelectorAll('.tab-header').forEach(header => {
				header.addEventListener('click', function () {
					const faction = this.dataset.faction;
					document.querySelectorAll('.tab-header').forEach(h => h.classList.remove('active'));
					document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
					this.classList.add('active');
					document.getElementById(`tab-${faction}`).classList.add('active');
				});
			});

			// Add click event listener to sub-tabs
			document.addEventListener('click', function (e) {
				if (e.target.classList.contains('sub-tab-header')) {
					const faction = e.target.dataset.faction;
					const category = e.target.dataset.category;
					document.querySelectorAll(`#tab-${faction} .sub-tab-header`).forEach(h => h.classList.remove('active'));
					document.querySelectorAll(`#tab-${faction} .sub-tab-content`).forEach(tab => tab.classList.remove('active'));

					e.target.classList.add('active');
					document.getElementById(`sub-tab-${faction}-${category}`).classList.add('active');
				}
			});
		})
		.catch(error => console.error('Error loading file_names.json:', error));

	// CREATING CONTENT FOR CANVAS
	function createCombatContent(container, faction, files, textData) {
		const sections = {
			's-section': files.combat.slice(0, 5),
			't1-section': files.combat.slice(5, 9),
			't2-section': files.combat.slice(9, 12),
			't3-section': files.combat.slice(12, 14)
		};
		const titles = {
			's-section': textData.combatText.title.slice(0, 5),
			't1-section': textData.combatText.title.slice(5, 9),
			't2-section': textData.combatText.title.slice(9, 12),
			't3-section': textData.combatText.title.slice(12, 14)
		};
		const generalText = {
			's-section': textData.combatText.general.slice(0, 5),
			't1-section': textData.combatText.general.slice(5, 9),
			't2-section': textData.combatText.general.slice(9, 12),
			't3-section': textData.combatText.general.slice(12, 14)
		};
		const unitText = {
			's-section': textData.combatText.unit.slice(0, 5),
			't1-section': textData.combatText.unit.slice(5, 9),
			't2-section': textData.combatText.unit.slice(9, 12),
			't3-section': textData.combatText.unit.slice(12, 14)
		};
		Object.keys(sections).forEach(section => {
			const sectionContainer = document.createElement('div');
			sectionContainer.classList.add('grid', 'combat', section);

			sections[section].forEach((file, idx) => {
				const jsonData = {};
				jsonData["picture"] = `factions/${faction}/combat/${file}`;
				jsonData["title"] = `${titles[section][idx]}`;
				jsonData["background"] = `${generalText[section][idx]}`;
				jsonData["foreground"] = `${unitText[section][idx]}`;
				const canvas = document.createElement('canvas');
				canvas.width = maxWidth;
				canvas.height = maxHeight;
				const context = canvas.getContext('2d');
				sectionContainer.appendChild(canvas);
				drawCombatCard(jsonData, context);

			});
			container.appendChild(sectionContainer);

		});
	}

	function createOrdersContent(container, faction, files, textData) {
		const categoryContainer = document.createElement('div');
		categoryContainer.classList.add('grid', 'orders');
		files['orders'].forEach((file, idx) => {

			const jsonData = {};
			jsonData["picture"] = `factions/${faction}/orders/${file}`;
			jsonData["title"] = `${textData.ordersText.title[idx]}`;
			jsonData["general"] = `${textData.ordersText.general[idx]}`;
			const canvas = document.createElement('canvas');
			canvas.width = maxWidth;
			canvas.height = maxHeight;
			const context = canvas.getContext('2d');
			categoryContainer.appendChild(canvas);
			drawOrderCard(jsonData, context);
		});
		container.appendChild(categoryContainer);
	}

	function createEventContent(container, faction, files, textData) {
		const categoryContainer = document.createElement('div');
		categoryContainer.classList.add('grid', 'events');
		files['events'].forEach((file, idx) => {
			const jsonData = {};
			jsonData["picture"] = `factions/${faction}/events/${file}`;
			jsonData["title"] = `${textData.eventsText.title[idx]}`;
			jsonData["general"] = `${textData.eventsText.general[idx]}`;
			jsonData["type"] = `${textData.eventsText.type[idx]}`;

			const canvas = document.createElement('canvas');
			canvas.width = maxWidth;
			canvas.height = maxHeight;
			const context = canvas.getContext('2d');
			categoryContainer.appendChild(canvas);
			drawEventCard(jsonData, context);
		});
		container.appendChild(categoryContainer);
	}

	// CANVAS TOOLS
	function replaceForbiddenStarsElements(str) {
		str = str.replace(/\[B\]/g, "}");
		str = str.replace(/\[S\]/g, "{");
		str = str.replace(/\[M\]/g, "<");
		str = str.replace(/\[D\]/g, "|");
		str = str.replace(/\(B\)/g, "#");
		str = str.replace(/\(S\)/g, "@");
		return str
	}

	function calculateTextHeight(context, text, extraHeight, marginHeight, interline, fontSize) {
		context.font = `${fontSize}px ForbiddenStars`;
		const words = text.split(' ');
		let line = '';
		let lineHeight = parseInt(context.font.match(/\d+/), 10);
		let returnHeight = 0;
		for (let n = 0; n < words.length; n++) {
			if (words[n] === "*newline*") {
				returnHeight += lineHeight + interline;
				line = '';
			}
			else if (words[n] === "*newpara*") {
				returnHeight += 2 * lineHeight;
				line = '';
			}
			else {
				const testLine = line + words[n] + ' ';
				const metrics = context.measureText(testLine);
				if (metrics.width > maxTextWidth && n > 0) {
					returnHeight += lineHeight + interline;
					line = words[n] + ' ';
				} else {
					line = testLine;
				}
			}
		}
		returnHeight += lineHeight * 2 + extraHeight + marginHeight * 2;
		return returnHeight;
	};


	function loadImage(url) {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.onload = () => resolve(img);
			img.onerror = () => reject(new Error('Failed to load image'));
			// img.src = `${url}?cb=${new Date().getTime()}`;
			img.src = url;
		});
	};

	// DRAWING CANVAS SECTION
	async function drawCombatCard(data, ctx) {
		const bottomImageheight = maxHeight * 0.025;
		const maxFieldsHeight = maxHeight * 0.4;
		const extraForegroundTriangle = maxHeight * 0.0455;
		const extraBackgroundborder = maxHeight * 0.0385;

		let interline = maxHeight * 0.0077;
		let marginHeight = maxWidth * 0.05;
		let fontSize = maxHeight * 0.03;

		// Load images from paths
		const picture = await loadImage(data.picture);
		const background = await loadImage('pictures/background.png');
		const foreground = await loadImage('pictures/foreground.png');
		const bottomImage = await loadImage('pictures/bottom.png');

		// Initial settings for margin and font size
		let backgroundTextHeight = 0;
		let foregroundTextHeight = 0;

		// Replacing all characters ForbiddenStars Related
		const backgroundWithFbElements = replaceForbiddenStarsElements(data.background)
		const foregroundWithFbElements = replaceForbiddenStarsElements(data.foreground)

		// Cards text height Declaration
		const recalculateTextHeight = () => {
			if (data.background.length > 0) {
				backgroundTextHeight = calculateTextHeight(ctx, backgroundWithFbElements, extraBackgroundborder, marginHeight, interline, fontSize);
			}
			if (data.foreground.length > 0) {
				foregroundTextHeight = calculateTextHeight(ctx, foregroundWithFbElements, extraForegroundTriangle, marginHeight, interline, fontSize);
			}
		};
		recalculateTextHeight()

		const resizeCardText = () => {
			marginHeight *= 0.8;
			fontSize *= 0.99;
			interline *= 0.95;
			recalculateTextHeight();
		};

		if (data.background.length > 0 && data.foreground.length > 0) {
			while ((backgroundTextHeight + foregroundTextHeight) > maxFieldsHeight) {
				resizeCardText();
			};
		} else {
			while (Math.max(backgroundTextHeight, foregroundTextHeight) > maxFieldsHeight) {
				resizeCardText();
			};
		};

		const drawText = (text, yPosition, extra) => {
			ctx.font = `${fontSize}px ForbiddenStars`;
			const words = text.split(' ');
			let line = '';
			let lineHeight = parseInt(ctx.font.match(/\d+/), 10);
			yPosition += marginHeight + extra + lineHeight;
			for (let n = 0; n < words.length; n++) {
				if (words[n] === "*newline*") {
					ctx.fillText(line, marginWidth, yPosition);
					yPosition += lineHeight + interline;
					line = '';
				}
				else if (words[n] === "*newpara*") {
					ctx.fillText(line, marginWidth, yPosition);
					yPosition += 2 * lineHeight;
					line = '';
				}
				else {
					const testLine = line + words[n] + ' ';
					const metrics = ctx.measureText(testLine);
					if (metrics.width > maxWidth - 2 * marginWidth && n > 0) {
						ctx.fillText(line, marginWidth, yPosition);
						yPosition += lineHeight + interline;
						line = words[n] + ' ';
					} else {
						line = testLine;
					};
				};
			};
			ctx.fillText(line, marginWidth, yPosition);
		};
		const drawImageCropped = (img, height) => {
			ctx.drawImage(img, 0, 0, textBackgroundSize, maxHeight - height, 0, height, maxWidth, maxHeight - height);
		};

		// Draw the main picture resized		
		ctx.drawImage(picture, 0, 0, maxWidth, maxHeight);

		// Draw the Title
		ctx.font = `${titleFontSize}px HeadlinerNo45`;
		ctx.fillText(data.title, maxWidth * 0.25, maxHeight * 0.077);

		if (data.background.length > 0) {
			const backgroundY = maxHeight - (backgroundTextHeight + foregroundTextHeight);
			drawImageCropped(background, backgroundY);
			drawText(backgroundWithFbElements, backgroundY, extraBackgroundborder);
		}

		if (data.foreground.length > 0) {
			const foregroundY = maxHeight - (foregroundTextHeight + extraForegroundTriangle * 0.35);
			drawImageCropped(foreground, foregroundY);
			drawText(foregroundWithFbElements, foregroundY, extraForegroundTriangle);
		}
		ctx.drawImage(bottomImage, 0, 0, textBottomBarWidth, textBottomBarHeight, 0, maxHeight - bottomImageheight, maxWidth, bottomImageheight);

	}

	function drawOrderCard(data, ctx) {
		const maxFieldsHeight = maxHeight * 0.455;
		const textPosition = maxHeight * 0.54;
		const marginOrderWidth = maxHeight * 0.1;

		let interline = maxHeight * 0.0077;
		let fontSize = maxHeight * 0.03;

		// Load images from paths
		const picture = new Image();
		picture.src = data.picture;

		// Initial settings for margin and font size
		let generalTextHeight = 0;

		const generalTextWithFbElements = replaceForbiddenStarsElements(data.general)

		const recalculateTextHeight = () => {
			generalTextHeight = calculateTextHeight(ctx, generalTextWithFbElements, 0, marginOrderWidth, interline, fontSize);
		};

		const resizeAllShit = () => {
			fontSize *= 0.95;
			interline *= 0.97;
			recalculateTextHeight();
		};

		recalculateTextHeight()
		while (generalTextHeight > maxFieldsHeight) {
			resizeAllShit();
		};

		const drawText = (text, yPosition) => {
			ctx.font = `${fontSize}px ForbiddenStars`;
			const words = text.split(' ');
			let line = '';
			let lineHeight = parseInt(ctx.font.match(/\d+/), 10);
			yPosition += lineHeight;
			for (let n = 0; n < words.length; n++) {
				if (words[n] === "*newline*") {
					ctx.fillText(line, maxWidth * 0.5, yPosition);
					yPosition += lineHeight + interline;
					line = '';
				}
				else if (words[n] === "*newpara*") {
					returnHeight += 2 * lineHeight;
					line = '';
				}
				else {
					const testLine = line + words[n] + ' ';
					const metrics = ctx.measureText(testLine);
					if (metrics.width > maxWidth - 2 * marginOrderWidth && n > 0) {
						ctx.fillText(line, maxWidth * 0.5, yPosition);
						yPosition += lineHeight + interline;
						line = words[n] + ' ';
					} else {
						line = testLine;
					};
				};
			};
			ctx.fillText(line, maxWidth * 0.5, yPosition);
		};

		// Draw the main picture resized
		picture.onload = function () {
			ctx.drawImage(picture, 0, 0, maxWidth, maxHeight);

			// Draw the Title
			ctx.font = `${titleFontSize}px HeadlinerNo45`;
			ctx.textAlign = "center";
			ctx.fillText(data.title, maxWidth * 0.5, maxHeight * 0.2325);

			drawText(generalTextWithFbElements, textPosition);
		};
	}

	function drawEventCard(data, ctx) {
		const maxFieldsHeight = maxHeight * 0.278;
		const textPosition = maxHeight * 0.685;

		let interline = maxHeight * 0.0077;
		let fontSize = maxHeight * 0.03;

		// Load images from paths
		const picture = new Image();
		picture.src = data.picture;

		// Initial settings for margin and font size
		let generalTextHeight = 0;

		const generalTextWithFbElements = replaceForbiddenStarsElements(data.general);

		const recalculateTextHeight = () => {
			generalTextHeight = calculateTextHeight(ctx, generalTextWithFbElements, 0, 0, interline, fontSize);
		};

		const resizeAllShit = () => {
			fontSize *= 0.95;
			interline *= 0.97;
			recalculateTextHeight()
		};

		recalculateTextHeight()
		while (generalTextHeight > maxFieldsHeight) {
			resizeAllShit();
		};

		const drawText = (text, yPosition) => {
			ctx.font = `${fontSize}px ForbiddenStars`;
			const words = text.split(' ');
			let line = '';
			let lineHeight = parseInt(ctx.font.match(/\d+/), 10);
			yPosition += lineHeight;
			for (let n = 0; n < words.length; n++) {
				if (words[n] === "*newline*") {
					ctx.fillText(line, marginWidth, yPosition);
					yPosition += lineHeight + interline;
					line = '';
				}
				else if (words[n] === "*newpara*") {
					ctx.fillText(line, marginWidth, yPosition);
					yPosition += 2 * lineHeight;
					line = '';
				}
				else {
					const testLine = line + words[n] + ' ';
					const metrics = ctx.measureText(testLine);
					if (metrics.width > maxWidth - 2 * marginWidth && n > 0) {
						ctx.fillText(line, marginWidth, yPosition);
						yPosition += lineHeight + interline;
						line = words[n] + ' ';
					} else {
						line = testLine;
					};
				};
			};
			ctx.fillText(line, marginWidth, yPosition);
		};
		// Draw the main picture resized
		picture.onload = function () {
			ctx.drawImage(picture, 0, 0, maxWidth, maxHeight);

			// Draw the Title
			ctx.font = `${titleFontSize * 0.8}px FrizQuadrataStd`;
			ctx.textAlign = "center";
			ctx.fillText(data.type, maxWidth * 0.5, maxHeight * 0.573);
			ctx.font = `${titleFontSize}px HeadlinerNo45`;
			ctx.textAlign = "left";
			ctx.fillText(data.title, maxWidth  * 0.05, maxHeight * 0.0735);

			drawText(generalTextWithFbElements, textPosition);
		};
	};
});

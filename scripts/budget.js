import { branches, etapes } from "../config.js";

function parseBudget(markdown) {
	const budget = {};
	const tableRegex = /\|(.+?)\|\s*([\d\s]+€)\s*\|/g;
	let match;
	while ((match = tableRegex.exec(markdown)) !== null) {
		const brancheRaw = match[1].trim().split("(")[0].trim();
		const cost = match[2].trim();
		const branche = branches.find((b) => b.name.startsWith(brancheRaw));
		if (branche) {
			budget[branche.name] = cost;
		}
	}
	return budget;
}

export async function generateBudgetTable() {
	const phases = etapes;

	try {
		const phaseBudgets = await Promise.all(
			phases.map(async (phase) => {
				const response = await fetch(`documents/${phase.file}?v=${new Date().getTime()}`);
				if (!response.ok) throw new Error(`Could not load ${phase.file}`);
				const text = await response.text();
				return { phase: phase.name, budget: parseBudget(text) };
			})
		);

		const tableData = {};
		branches.forEach((branch) => {
			tableData[branch.name] = {};
		});

		phaseBudgets.forEach(({ phase, budget }) => {
			for (const branche in budget) {
				if (tableData[branche]) {
					tableData[branche][phase] = budget[branche];
				}
			}
		});

		const totals = {
			Lancement: 0,
			Développement: 0,
			Accomplissement: 0,
			Agrandissement: 0,
			Total: 0,
		};

		function parseCurrency(value) {
			if (!value) return 0;
			return parseInt(value.replace(/[\s€]/g, ""));
		}

		let tableBody = "";
		branches.forEach((branch) => {
			let rowTotal = 0;
			let row = `<tr><td><a href="#" data-file="${branch.file}">${branch.name}</a></td>`;
			phases.forEach((phase) => {
				const value = tableData[branch.name]?.[phase.name] || "0 €";
				const numericValue = parseCurrency(value);
				row += `<td style="text-align: right;">${value}</td>`;
				rowTotal += numericValue;
				totals[phase.name] += numericValue;
			});
			totals.Total += rowTotal;
			row += `<td style="text-align: right;">${rowTotal.toLocaleString("fr-FR")} €</td></tr>`;
			tableBody += row;
		});

		const formatTotal = (total) => `<strong>${total.toLocaleString("fr-FR")} €</strong>`;

		return `
            <div style="font-size: small;">
                <table>
                    <thead>
                        <tr>
                            <th>Branche</th>
                            ${phases.map((p) => `<th style="text-align: right;">${p.name}</th>`).join("")}
                            <th style="text-align: right;">Total</th>
                        </tr>
                    </thead>
                    <tbody>${tableBody}</tbody>
                    <tfoot>
                        <tr>
                            <th style="text-align: left;"><strong>TOTAL</strong></th>
                            <th style="text-align: right;">${formatTotal(totals.Lancement)}</th>
                            <th style="text-align: right;">${formatTotal(totals.Développement)}</th>
                            <th style="text-align: right;">${formatTotal(totals.Accomplissement)}</th>
                            <th style="text-align: right;">${formatTotal(totals.Agrandissement)}</th>
                            <th style="text-align: right;">${formatTotal(totals.Total)}</th>
                        </tr>
                    </tfoot>
                </table>
            </div>
        `;
	} catch (error) {
		console.error("Failed to generate budget table:", error);
		return `<p style="color: red;">Erreur de génération du tableau budgétaire.</p>`;
	}
}

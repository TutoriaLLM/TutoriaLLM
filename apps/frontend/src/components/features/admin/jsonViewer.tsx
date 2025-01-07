import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { t } from "i18next";
import type React from "react";
import { Trans } from "react-i18next";

type JSONFieldProps = {
	obj: Record<string, unknown>;
	setObj: (newObj: Record<string, unknown> | undefined) => void;
	path?: string[];
};

const JSONField = ({ obj, setObj, path = [] }: JSONFieldProps) => {
	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement>,
		key: string,
		index?: number,
	) => {
		const value =
			e.target.type === "checkbox" ? e.target.checked : e.target.value;
		const newValue = {
			...obj,
			[key]: e.target.type === "number" ? +value : value,
		};

		if (typeof index === "number") {
			const arr = Array.isArray(obj[key]) ? [...(obj[key] as unknown[])] : [];
			arr[index] = e.target.type === "number" ? +value : value;
			setObj({ ...obj, [key]: arr });
		} else {
			setObj(newValue);
		}
	};

	const renderInputField = (key: string, value: unknown, index?: number) => {
		if (typeof value === "boolean") {
			return (
				<Input
					type="checkbox"
					className="w-5 h-5 rounded-md p-1.5 px-2"
					checked={value}
					onChange={(e) => handleChange(e, key, index)}
				/>
			);
		}
		if (typeof value === "number") {
			return (
				<Input
					type="number"
					className="w-20"
					step={0.1}
					value={value}
					onChange={(e) => handleChange(e, key, index)}
				/>
			);
		}
		if (typeof value === "string") {
			return (
				<Input
					type="text"
					value={value}
					onChange={(e) => handleChange(e, key, index)}
				/>
			);
		}
		return <div>Type not supported</div>;
	};

	const addItemToArray = (key: string) => {
		const arr = Array.isArray(obj[key]) ? [...(obj[key] as unknown[])] : [];
		setObj({ ...obj, [key]: [...arr, ""] });
	};

	const removeItemFromArray = (key: string, index: number) => {
		const arr = Array.isArray(obj[key]) ? [...(obj[key] as unknown[])] : [];
		setObj({ ...obj, [key]: arr.filter((_, i) => i !== index) });
	};

	return (
		<div className="space-y-4">
			{Object.keys(obj).map((key, index) => {
				const value = obj[key];

				// Get localized strings using Trans
				const localizedKey = <Trans t={t}>AppConfig.{key}</Trans>;

				if (typeof value === "object" && value !== null) {
					if (Array.isArray(value)) {
						return (
							<div key={index}>
								<h3 className="font-semibold text-lg">{localizedKey}</h3>
								{value.map((item, itemIndex) => (
									<div key={itemIndex} className="flex items-center mb-2">
										{renderInputField(key, item, itemIndex)}
										<Button
											type="button"
											onClick={() => removeItemFromArray(key, itemIndex)}
											variant="destructive"
										>
											Remove
										</Button>
									</div>
								))}
								<Button type="button" onClick={() => addItemToArray(key)}>
									Add Item
								</Button>
							</div>
						);
					}
					return (
						<div key={index} className="space-y-2">
							<h3 className="font-semibold text-lg border-l-4  pl-2">
								{localizedKey}
							</h3>
							<JSONField
								obj={value as Record<string, unknown>}
								setObj={(newSubObj) => {
									const newObject = { ...obj };
									newObject[key] = newSubObj;
									setObj(newObject);
								}}
								path={[...path, key]}
							/>
						</div>
					);
				}
				return (
					<div className="flex flex-col mb-2" key={index}>
						<span>
							{localizedKey}:{renderInputField(key, value)}
						</span>
					</div>
				);
			})}
		</div>
	);
};

export default JSONField;

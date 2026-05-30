import { Select as SelectPrimitive } from "bits-ui";
import Root from "./select.svelte";
import Content from "./select-content.svelte";
import Item from "./select-item.svelte";
import Trigger from "./select-trigger.svelte";

const Value = SelectPrimitive.Value;

export {
	Root,
	Value,
	Content,
	Item,
	Trigger,
	//
	Root as Select,
	Value as SelectValue,
	Content as SelectContent,
	Item as SelectItem,
	Trigger as SelectTrigger,
};

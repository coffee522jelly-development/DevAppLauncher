import { Dialog as DialogPrimitive } from "bits-ui";

import Root from "./dialog.svelte";
import Content from "./dialog-content.svelte";
import Header from "./dialog-header.svelte";
import Title from "./dialog-title.svelte";

const Trigger = DialogPrimitive.Trigger;
const Close = DialogPrimitive.Close;

export {
	Root,
	Trigger,
	Content,
	Header,
	Title,
	Close,
	//
	Root as Dialog,
	Trigger as DialogTrigger,
	Content as DialogContent,
	Header as DialogHeader,
	Title as DialogTitle,
	Close as DialogClose,
};

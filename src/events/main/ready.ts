import { client } from '../..';
import { Event } from './../../structs/types/event';

export default new Event({
    name: "ready",
    once: true,
    run() {
        const { commands, buttons, selects, modals } = client;
        console.log("✅ Bot online".green);
        console.log(`Commands: ${commands.size} 📟`.gray);
        console.log(`Buttons: ${buttons.size} 🖲️`.gray);
        console.log(`Selects: ${selects.size} 📃`.gray);
        console.log(`Modals: ${modals.size} 🏁`.gray);
    }
})
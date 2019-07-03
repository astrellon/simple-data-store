import DataStore from "../src";

interface State
{
    age: number;
    name: string;
}

const store = new DataStore<State>
({
    age: 30,
    name: "Fluff"
});

store.subscribe((state) => state.age, (state, newAge) => console.log('New Age', newAge));
store.subscribe((state) => state.name, (state, newName) => console.log('New Name', newName));

store.execute((state) => ({age: 35}));
store.execute((state) => ({name: "Puff"}));
store.execute((state) => ({age: 40}));

/* Example output
New Age 35
New Name Puff
New Age 40
*/
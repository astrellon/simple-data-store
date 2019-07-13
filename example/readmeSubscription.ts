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

let numberOfAgeChanges = 0;

// Subscribe to any changes to the age by returning the age from the state which will be compared between execute calls.
store.subscribe((state) => state.age, (state, newAge) => console.log('New Age', newAge));

// Subscribe to any changes to the name by returning the name from the state which will be compared between execute calls.
store.subscribe((state) => state.name, (state, newName) => console.log('New Name', newName));

// Subscribe to any changes to the age by adding our own way of comparing age changing.
store.subscribe((state) => state, (state) => numberOfAgeChanges++, (prev, next) => next.age === prev.age);

store.execute((state) => ({age: 35}));
store.execute((state) => ({name: "Puff"}));
store.execute((state) => ({age: 40}));
store.execute((state) => ({age: 40}));

console.log('Number of age changes', numberOfAgeChanges);

/* Example output
New Age 35
New Name Puff
New Age 40
Number of age changes 2
*/
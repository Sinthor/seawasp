# SeaWasp

<b>SeaWasp</b> enables different (web)-components or libraries to communicate with each other via a simple to use WebRTC layer.  

[Use cases](##use-cases)

[How to](##how-to)

[Examples](##examples)

## Use cases

<b>Communication</b>
- between web components
- between micro frontends
- between different frameworks (e.g. a website, partly written in Vue, partly in Angular)
- within a framework


## How to

### Install SeaWasp via <b>npm</b>

<code>npm install seawasp</code>

### Import SeaWasp in each component you want to connect to the RTC-layer and create a `Bell`.  
  
```ts
  // NavigationComponent
  import { SeaWasp } from 'seawasp';
  ...
  const bell = new SeaWasp.Bell();
```
```ts
  // MenuComponent
  import { SeaWasp } from 'seawasp';
  ...
  const bell = new SeaWasp.Bell();
```
### Connect to the SeaWasp layer by creating a tentacle and give it a unique identifier. This identifier is used from other components to send messages to this component.
```ts
  // NavigationComponent
  const canal: SeaWasp.Canal = this.bell.registerTentacle('NavigationComponent');

  canal.onMessage = (event) => console.log('Received message: ', event.data);
  canal.onOpen = (event) => ...
  canal.onClose = (event) => ...
  canal.onError = (event) => ...
```
```ts
  // MenuComponent
  const canal: SeaWasp.Canal = this.bell.registerTentacle('MenuComponent');

  canal.onMessage = (event) => console.log('Received message: ', event.data);
  canal.onOpen = (event) => ...
  canal.onClose = (event) => ...
  canal.onError = (event) => ...
```
### Send messages to other components/listeners etc.
```ts
// NavigationComponent
var data: SeaWasp.Message = {
  // As receiver enter the unique identifier string from the component you want to send a message to
  receiver: 'MenuComponent',
  // The identifier string from this component
  sender: 'NavigationComponent',
  // payload accepts a string or object which can be JSON.stringify.
  payload: {
    msg: 'Hello Menu',
  },
};
// Send it!
this.canal.send(data).then((wasSuccessful) => console.log('Successfully sent: ', wasSuccessful));
```

## Examples

#### SeaWasp + Javascript
This example shows a basic conceptual usage of SeaWasp with plain javascript.  
https://stackblitz.com/edit/js-hbdyqn?file=index.js

#### SeaWasp + Angular
This example simply shows how to communicate between two components.   
NOTE! This works the same if you create web-components out of it.  
https://stackblitz.com/edit/angular-ivy-4h5gzm  

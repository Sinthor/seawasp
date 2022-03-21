# SeaWasp

<b>SeaWasp</b> enables different (web)-components or libraries to communicate which each other via a simple to use WebRTC layer.

## Potential use cases

<b>Communication</b>
- between web components (independed from the underlying libraries)
- between micro frontends
- between different frameworks (e.g. a website, partly written in Vue, partly in Angular)
- within a framework


## How to

#### Install SeaWasp via <b>npm</b>

<code>npm install seawasp</code>

#### Import SeaWasp into your components and create two objects  
  
```ts
  import { SeaWasp } from 'seawasp';
  ...
  let canal: SeaWasp.Canal;  
  const bell = new SeaWasp.Bell();
```

#### Connect to the SeaWasp layer by creating a tentacle and give it a unique identifier
```ts
    this.canal = this.bell.registerTentacle('uniqueComponentIndentifier');
```

#### Listen to events and messages

```ts
    this.canal.onMessage = (event) => {
      console.log('Message: ', event.data);
    };
    this.canal.onOpen = (event) => ...
    this.canal.onClose = (event) => ...
    this.canal.onError = (event) => ...
```
#### Send messages to other components/listeners etc.
```ts
    var data: SeaWasp.Message = {
      // As receiver enter the unique identifier string you specified while registering the tentacle in the OTHER component
      receiver: 'otherComponentIdentifier',
      // The identifier string, specified a few lines above
      sender: 'uniqueComponentIndentifier',
      // payload accepts any kind of string or object which can be JSON.stringify.
      payload: {
        msg: 'Hello component',
      },
    };
    // Send it!
    this.canal.send(data);
```

## Examples

#### SeaWasp + Angular
This example simply shows how to communicate between two components.   
NOTE! This works the same if you create web-components out of it.  
https://angular-ivy-4h5gzm.stackblitz.io

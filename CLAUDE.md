- Use the iTerm MCP for running metro, and use the mobile MCP to test on the iPhone simulator.
- You can start the WebDriverAgent yourself, it's in /Users/shan/WebDriverAgent
- Survey-core works as a node module on API backends, so there's no fundamental reason it can't work in React Native - it just needs proper polyfills for browser APIs.
- There was another attempt at what this project is supposed to do at https://github.com/shiftsmartinc/surveyjs-react-native remember to review what they did in case there's any useful tricks.
- Be sure to always get your task branch merged back in to the main branch before moving on to the next task.
- iTerm isn't responding well to control-c to exit metro. You're better off using "kill" in bash to stop metro in iTerm
- If you haven't made any changes to the native side (installed a native module, etc) then you can just run "yarn start" instead of "yarn ios" and then launch the app in the simulator. That way you don't have to recompile the binary every time.
- When commiting code changes, don't forget to also commit the claude / simone changes too

## Survey-Core React Native Integration

Survey-core requires browser APIs that don't exist in React Native. Here's how we fixed it:

### Fix Applied:
1. **Built survey-core from source** - The TypeScript source contains browser API calls that need to be compiled with our fixes
2. **Fixed window.addEventListener errors** in two places:
   - `src/dragdrop/dom-adapter.ts` - Updated to use DomWindowHelper with proper checks
   - `src/settings.ts` - Updated document.head access to use DomDocumentHelper.isAvailable()
3. **Created React Native wrapper** (`survey-core-rn/`) that:
   - Sets up minimal window/document polyfills before loading survey-core
   - Points to the built version of our forked survey-core

### Build Process:
```bash
cd survey-library-fork/packages/survey-core
npm install
npm run build
```

The fork is at: https://github.com/iotashan/survey-library
Upstream remote is also configured for future PR submission.
```
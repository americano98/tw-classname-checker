(() => {
  const BASE_SIZE_VALUES = {
    "1": "px",
    "2": "0.5",
    "4": "1",
    "6": "1.5",
    "8": "2",
    "10": "2.5",
    "12": "3",
    "14": "3.5",
    "16": "4",
    "20": "5",
    "24": "6",
    "28": "7",
    "32": "8",
    "36": "9",
    "40": "10",
    "44": "11",
    "48": "12",
    "56": "14",
    "64": "16",
    "80": "20",
    "96": "24",
    "112": "28",
    "128": "32",
    "144": "36",
    "160": "40",
    "176": "44",
    "192": "48",
    "208": "52",
    "224": "56",
    "240": "60",
    "256": "64",
    "288": "72",
    "320": "80",
    "384": "96"
  }
  const MAXW_VALUES = {
    "320" : "xs",
    "384" : "sm",
    "448" : "md",
    "512" : "lg",
    "576" : "xl",
    "672" : "2xl",
    "768" : "3xl",
    "896" : "4xl",
    "1024" : "5xl",
    "1152" : "6xl",
    "1280" : "7xl",
  }
  const ROUNDED_VALUES = {
    "2": "sm",
    "4": "",
    "6": "md",
    "8": "lg",
    "12": "xl",
    "16": "2xl",
    "24": "3xl",
  }
  
  const getNum = (stringValue) =>  stringValue.match(/\d+/g);
  
  const addError = (errors, className, codeLine, values) => {
    const numValue = getNum(className);
    if (values[numValue]) {
      const anchor = `tw-error-${errors.length+1}`
      const [baseClassName] = className.split('[');
      let recomended = baseClassName + values[numValue];
      if (recomended === "rounded-") {
        recomended = "rounded";
      }
      errors.push({value: className, changeTo: recomended, anchor});
      codeLine.innerHTML = codeLine.innerHTML.replace(className, `<span id=${anchor} style='color:red; font-weight:bold; font-size:1.05rem' title="recomended: ${recomended}">❗${className}</span>`)
    }
  }
  
  const highlightIncorrectClasses = () => {
    const regex = /(rounded|w|h|max-w|max-h|m|mt|mb|ml|mr|mx|my|p|pb|pl|pr|pt|px|py|left|right|top|bottom|inset|inset-x|inset-y|translate-x|translate-y)-\[\d+px\]/g;
    const codeLines = document.querySelectorAll('[data-code-marker="+"]');
    const errors = [];

    codeLines.forEach(codeLine => {
      const code = codeLine.innerText.trim();
      const matches = code.matchAll(regex);
  
  
      if (matches) {
        for (const match of matches) {
          if (match[0].startsWith('max-w')) {
            addError (errors, match[0], codeLine, MAXW_VALUES);
          } else if(match[0].startsWith('rounded')) {
            addError (errors, match[0], codeLine, ROUNDED_VALUES);
          } else {
            addError (errors, match[0], codeLine, BASE_SIZE_VALUES);
          }
        }
      }
    })
      
    return errors;
  }

  const getPageHeight = () => {
    return Math.max(
      document.body.scrollHeight, document.documentElement.scrollHeight,
      document.body.offsetHeight, document.documentElement.offsetHeight,
      document.body.clientHeight, document.documentElement.clientHeight
    );
  }
  let isPageLoaded = false;

  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    const { type, anchor } = obj;

    if (type === "PR_OPENED") {
      // wainting for content lazy code loading
      let initialHeight = 0;
      const intervalId = setInterval(() => {
        const currentHeight = getPageHeight();
        if (initialHeight !== currentHeight) {
          initialHeight = currentHeight;
        } else {
          isPageLoaded = true;
          clearInterval(intervalId);
        }
      }, 3500);
    } 
    else if (type === "GET_ERRORS") {
      if (!isPageLoaded) {
        response({isPageLoaded});
        return;
      }

      const errors = highlightIncorrectClasses();
      response({isPageLoaded, errors});
    }
    else if (type === "SCROLL_TO_ERROR") {
      document.getElementById(anchor).scrollIntoView({behavior: "smooth", block: "center"});
    }
  })
})();
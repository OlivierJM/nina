function applyTemplate(template, vars) {
    return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => {
      return key in vars ? vars[key] : "";
    });
  }

exports.applyTemplate = applyTemplate;
module.exports = {
  extends: ['stylelint-config-standard'],
  plugins: ['stylelint-order'],
  rules: {
    'order/properties-alphabetical-order': true,
    'media-feature-range-notation': null,
    'declaration-no-important': null,
    // Allow BEM naming (block__element--modifier)
    'selector-class-pattern': [
      '^[a-z][a-z0-9]*(-[a-z0-9]+)*(__[a-z][a-z0-9]*(-[a-z0-9]+)*)?(--[a-z][a-z0-9]*(-[a-z0-9]+)*)?$',
      { message: 'Expected BEM-style class selector' },
    ],
    'property-no-vendor-prefix': true,
    // Allow empty lines between custom property groups for readability
    'custom-property-empty-line-before': null,
  },
};

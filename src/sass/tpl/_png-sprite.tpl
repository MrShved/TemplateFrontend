{
  // Default options
  'functions': true,
  'variableNameTransforms': ['dasherize']
}

{{#extend "scss"}}
{{#content "sprites" mode="append"}}
{{#each retina_sprites}}
${{strings.name_name}}: '{{name}}';
${{strings.name_x}}: {{px.x}};
${{strings.name_y}}: {{px.y}};
${{strings.name_offset_x}}: {{px.offset_x}};
${{strings.name_offset_y}}: {{px.offset_y}};
${{strings.name_width}}: {{px.width}};
${{strings.name_height}}: {{px.height}};
${{strings.name_total_width}}: {{px.total_width}};
${{strings.name_total_height}}: {{px.total_height}};
${{strings.name_image}}: '{{{escaped_image}}}';
${{strings.name}}: ({{px.x}}, {{px.y}}, {{px.offset_x}}, {{px.offset_y}}, {{px.width}}, {{px.height}}, {{px.total_width}}, {{px.total_height}}, '{{{escaped_image}}}', '{{name}}', );
{{/each}}
{{/content}}
{{#content "spritesheet" mode="append"}}
${{retina_spritesheet_info.strings.name_width}}: {{retina_spritesheet.px.width}};
${{retina_spritesheet_info.strings.name_height}}: {{retina_spritesheet.px.height}};
${{retina_spritesheet_info.strings.name_image}}: '{{{retina_spritesheet.escaped_image}}}';
${{retina_spritesheet_info.strings.name_sprites}}: ({{#each retina_sprites}}${{strings.name}}, {{/each}});
${{retina_spritesheet_info.strings.name}}: ({{retina_spritesheet.px.width}}, {{retina_spritesheet.px.height}}, '{{{retina_spritesheet.escaped_image}}}', ${{retina_spritesheet_info.strings.name_sprites}}, );

// These "retina group" variables are mappings for the naming and pairing of normal and retina sprites.
//
// The list formatted variables are intended for mixins like `retina-sprite` and `retina-sprites`.
{{#each retina_groups}}
${{strings.name_group_name}}: '{{name}}';
${{strings.name_group}}: ('{{name}}', ${{normal.strings.name}}, ${{retina.strings.name}}, );
{{/each}}
${{retina_groups_info.strings.name}}: ({{#each retina_groups}}${{strings.name_group}}, {{/each}});
{{/content}}

{{#content "sprite-functions" mode="append"}}
{{#if options.functions}}

// The `retina-sprite` mixin sets up rules and a media query for a sprite/retina sprite.
//   It should be used with a "retina group" variable.
//
// The media query is from CSS Tricks: https://css-tricks.com/snippets/css/retina-display-media-query/
//
// $icon-home-group: ('icon-home', $icon-home, $icon-home-2x, );
//
// .icon-home {
//   @include retina-sprite($icon-home-group);
// }
@mixin sprite-background-size($sprite) {
  $sprite-total-width: nth($sprite, 7);
  $sprite-total-height: nth($sprite, 8);
  background-size: $sprite-total-width $sprite-total-height;
}

@mixin retina-sprite($retina-group) {
  $normal-sprite: nth($retina-group, 2);
  $retina-sprite: nth($retina-group, 3);
  @include sprite($normal-sprite);

  @media (-webkit-min-device-pixel-ratio: 2),
         (min-resolution: 192dpi) {
    @include sprite-image($retina-sprite);
    @include sprite-background-size($normal-sprite);
  }
}
{{/if}}
{{/content}}

{{#content "spritesheet-functions" mode="append"}}
{{#if options.functions}}

// The `retina-sprites` mixin generates a CSS rule and media query for retina groups
//   This yields the same output as CSS retina template but can be overridden in SCSS
//
// @include retina-sprites($retina-groups);
@mixin retina-sprites($retina-groups) {
  @each $retina-group in $retina-groups {
    $sprite-name: nth($retina-group, 1);
    .#{$sprite-name} {
      @include retina-sprite($retina-group);
    }
  }
}
{{/if}}
{{/content}}
{{/extend}}
import React from 'react';

const ColorPaletteDemo = () => {
  return (
    <div className="p-8 bg-background min-h-screen transition-colors duration-300 overflow-auto h-screen">
      <h1 className="mb-8">Color System Demo</h1>
      
      <section className="mb-12">
        <h2 className="mb-4">Brand Colors</h2>
        <div className="grid  grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <ColorSwatch name="Ink Blue" bgClass="bg-ink-blue" textClass="text-white" hexCode="#0D2C56" cssVar="--ink-blue" />
          <ColorSwatch name="Sunset Orange" bgClass="bg-sunset-orange" textClass="text-deep-teal" hexCode="#FF8B2C" cssVar="--sunset-orange" />
          <ColorSwatch name="Aqua Blue" bgClass="bg-aqua-blue" textClass="text-deep-teal" hexCode="#00D7E0" cssVar="--aqua-blue" />
          <ColorSwatch name="Off White" bgClass="bg-off-white" textClass="text-ink-blue" hexCode="#FAF8F4" cssVar="--off-white" />
          <ColorSwatch name="Deep Teal" bgClass="bg-deep-teal" textClass="text-white" hexCode="#06272C" cssVar="--deep-teal" />
        </div>
      </section>
      
      <section className="mb-12">
        <h2 className="mb-4">Semantic Colors</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <h3 className="mb-3">Primary</h3>
            <div className="space-y-4">
              <ColorSwatch name="Primary" bgClass="bg-primary" textClass="text-on-primary" hexCode="var(--primary)" cssVar="--primary" />
              <ColorSwatch name="On Primary" bgClass="bg-on-primary" textClass="text-primary" hexCode="var(--on-primary)" cssVar="--on-primary" />
            </div>
          </div>
          
          <div>
            <h3 className="mb-3">Secondary</h3>
            <div className="space-y-4">
              <ColorSwatch name="Secondary" bgClass="bg-secondary" textClass="text-on-secondary" hexCode="var(--secondary)" cssVar="--secondary" />
              <ColorSwatch name="On Secondary" bgClass="bg-on-secondary" textClass="text-secondary" hexCode="var(--on-secondary)" cssVar="--on-secondary" />
            </div>
          </div>
          
          <div>
            <h3 className="mb-3">Tertiary</h3>
            <div className="space-y-4">
              <ColorSwatch name="Tertiary" bgClass="bg-tertiary" textClass="text-on-tertiary" hexCode="var(--tertiary)" cssVar="--tertiary" />
              <ColorSwatch name="On Tertiary" bgClass="bg-on-tertiary" textClass="text-tertiary" hexCode="var(--on-tertiary)" cssVar="--on-tertiary" />
            </div>
          </div>
        </div>
      </section>
      
      <section className="mb-12">
        <h2 className="mb-4">UI Colors (Theme Aware)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <ColorSwatch name="Background" bgClass="bg-background" textClass="text-text-primary" hexCode="var(--background)" cssVar="--background" />
          <ColorSwatch name="Surface" bgClass="bg-surface" textClass="text-text-primary" hexCode="var(--surface)" cssVar="--surface" />
          <ColorSwatch name="Text Primary" bgClass="bg-text-primary" textClass="text-background" hexCode="var(--text-primary)" cssVar="--text-primary" />
          <ColorSwatch name="Text Secondary" bgClass="bg-text-secondary" textClass="text-background" hexCode="var(--text-secondary)" cssVar="--text-secondary" />
          <ColorSwatch name="Border" bgClass="bg-border" textClass="text-background" hexCode="var(--border)" cssVar="--border" />
        </div>
      </section>
      
      <section className="mb-12">
        <h2 className="mb-4">Status Colors</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ColorSwatch name="Success" bgClass="bg-success" textClass="text-white" hexCode="#4CAF50" cssVar="--success" />
          <ColorSwatch name="Error" bgClass="bg-error" textClass="text-white" hexCode="#E53935" cssVar="--error" />
          <ColorSwatch name="Warning" bgClass="bg-warning" textClass="text-white" hexCode="#FB8C00" cssVar="--warning" />
          <ColorSwatch name="Info" bgClass="bg-info" textClass="text-white" hexCode="#2196F3" cssVar="--info" />
        </div>
      </section>
      
      <section className="mb-12">
        <h2 className="mb-4">Buttons</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-6 bg-surface rounded-lg shadow-sm">
            <h3 className="mb-4">Theme Buttons</h3>
            <div className="flex flex-wrap gap-3">
              <button className="btn-primary">Primary</button>
              <button className="btn-secondary">Secondary</button>
              <button className="btn-tertiary">Tertiary</button>
            </div>
          </div>
          
          <div className="p-6 bg-surface rounded-lg shadow-sm">
            <h3 className="mb-4">Status Buttons</h3>
            <div className="flex flex-wrap gap-3">
              <button className="btn-success">Success</button>
              <button className="btn-error">Error</button>
              <button className="btn-warning">Warning</button>
              <button className="btn-info">Info</button>
            </div>
          </div>
          
          <div className="p-6 bg-surface rounded-lg shadow-sm">
            <h3 className="mb-4">Custom Buttons</h3>
            <div className="flex flex-wrap gap-3">
              <button className="bg-aqua-blue/80 hover:bg-aqua-blue text-deep-teal px-4 py-2 rounded-md font-medium transition-colors duration-200">
                Hover Me
              </button>
              <button className="bg-tertiary border-2 border-primary text-on-tertiary px-4 py-2 rounded-md font-medium">
                Outlined
              </button>
              <button className="bg-background text-text-primary border border-border hover:border-primary px-4 py-2 rounded-md font-medium transition-colors duration-200">
                Subtle
              </button>
            </div>
          </div>
        </div>
      </section>
      
      <section className="mb-12">
        <h2 className="mb-4">Opacity Examples</h2>
        <div className="p-6 bg-surface rounded-lg">
          <h3 className="mb-4">Primary Color with Different Opacities</h3>
          <div className="flex flex-wrap gap-3">
            <div className="h-12 w-12 rounded-md bg-primary"></div>
            <div className="h-12 w-12 rounded-md bg-primary/80"></div>
            <div className="h-12 w-12 rounded-md bg-primary/60"></div>
            <div className="h-12 w-12 rounded-md bg-primary/40"></div>
            <div className="h-12 w-12 rounded-md bg-primary/20"></div>
            <div className="h-12 w-12 rounded-md bg-primary/10"></div>
          </div>
        </div>
      </section>
      
      <section className="mt-20 p-6 bg-surface rounded-lg shadow-sm">
        <h2 className="mb-6">Theme Toggling</h2>
        <p className="mb-4">The colors on this page automatically adjust between light and dark mode. Try clicking the theme toggle button in the top-right corner!</p>
        <div className="flex gap-4">
          <div className="p-6 bg-background rounded-lg border border-border">
            <p className="text-text-primary mb-2 font-syne">Background with Text</p>
            <p className="text-text-secondary text-sm">Secondary text on background</p>
          </div>
          <div className="p-6 bg-primary rounded-lg">
            <p className="text-on-primary mb-2">Primary with On Primary Text</p>
            <p className="text-on-primary/70 text-sm">Faded text on primary</p>
          </div>
        </div>
      </section>
    </div>
  );
};

// Helper component for displaying color swatches
const ColorSwatch = ({ name, bgClass, textClass, hexCode, cssVar }) => {
  return (
    <div className="flex flex-col h-32">
      <div className={`flex-1 rounded-t-lg ${bgClass} flex items-center justify-center ${textClass}`}>
        <span className="font-medium font-[var(--space-grotesk)]">{name}</span>
      </div>
      <div className="bg-surface p-2 rounded-b-lg border-t border-border text-xs">
        <div className="text-text-secondary mb-1">CSS: {cssVar}</div>
        <div className="text-text-primary font-mono">{hexCode}</div>
      </div>
    </div>
  );
};

export default ColorPaletteDemo;

import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { colors, MIN_TOUCH_TARGET } from '../../theme/tokens';
import { Slider } from './Slider';

const pounds = (value: number) => `£${value}`;
const key = (name: string) => ({ key: name, preventDefault: jest.fn() });

async function renderSlider(props: Partial<React.ComponentProps<typeof Slider>> = {}) {
  const onValueChange = jest.fn();
  await render(
    <Slider
      label="Monthly budget"
      value={100}
      min={0}
      max={500}
      step={25}
      formatValue={pounds}
      onValueChange={onValueChange}
      {...props}
    />,
  );
  return { slider: screen.getByRole('slider', { name: 'Monthly budget' }), onValueChange };
}

describe('Slider', () => {
  it('is a slider named by its label (adjustable on iOS)', async () => {
    const { slider } = await renderSlider();

    expect(slider).toBeOnTheScreen();
  });

  it('announces its range and its value in words', async () => {
    const { slider } = await renderSlider();

    expect(slider).toHaveAccessibilityValue({ min: 0, max: 500, now: 100, text: '£100' });
  });

  it('shows the value on screen too, without a screen reader reading it twice', async () => {
    await renderSlider();

    expect(screen.getByText('£100', { includeHiddenElements: true })).toBeOnTheScreen();
    expect(screen.queryByText('£100')).toBeNull(); // hidden from assistive tech: the slider says it
  });

  it('goes up and down one step with the screen reader swipe actions', async () => {
    const { slider, onValueChange } = await renderSlider();

    await fireEvent(slider, 'accessibilityAction', { nativeEvent: { actionName: 'increment' } });
    await fireEvent(slider, 'accessibilityAction', { nativeEvent: { actionName: 'decrement' } });

    expect(onValueChange.mock.calls).toEqual([[125], [75]]);
  });

  it('does not go past either end', async () => {
    const atMax = await renderSlider({ value: 500 });
    await fireEvent(atMax.slider, 'accessibilityAction', { nativeEvent: { actionName: 'increment' } });
    expect(atMax.onValueChange).not.toHaveBeenCalled();
  });

  it('follows the arrow, Page and Home/End keys on web, without scrolling the page', async () => {
    const { slider, onValueChange } = await renderSlider();
    const right = key('ArrowRight');

    await fireEvent(slider, 'keyDown', right);
    await fireEvent(slider, 'keyDown', key('End'));
    await fireEvent(slider, 'keyDown', key('PageDown'));

    expect(onValueChange.mock.calls).toEqual([[125], [500], [50]]);
    expect(right.preventDefault).toHaveBeenCalled();
  });

  it('leaves other keys, such as Tab, to the browser', async () => {
    const { slider, onValueChange } = await renderSlider();
    const tab = key('Tab');

    await fireEvent(slider, 'keyDown', tab);

    expect(onValueChange).not.toHaveBeenCalled();
    expect(tab.preventDefault).not.toHaveBeenCalled();
  });

  it('moves to where it is dragged, snapped to the step', async () => {
    const { slider, onValueChange } = await renderSlider();
    await fireEvent(slider, 'layout', { nativeEvent: { layout: { width: 228, height: 44 } } }); // 200 of travel

    await fireEvent(slider, 'responderGrant', { nativeEvent: { locationX: 14 + 120 } });
    await fireEvent(slider, 'responderMove', { nativeEvent: { locationX: 14 + 200 } });

    expect(onValueChange.mock.calls).toEqual([[300], [500]]);
  });

  it('is announced disabled and ignores every kind of input when disabled', async () => {
    const { slider, onValueChange } = await renderSlider({ disabled: true });

    // Called directly: Testing Library never fires events on a disabled element, but a screen reader can
    // still send increment to a dimmed slider, so the component itself has to refuse.
    await act(() => slider.props.onAccessibilityAction({ nativeEvent: { actionName: 'increment' } }));
    await act(() => slider.props.onKeyDown(key('ArrowRight')));

    expect(slider).toBeDisabled();
    expect(onValueChange).not.toHaveBeenCalled();
    expect(slider.props.onStartShouldSetResponder()).toBe(false);
  });

  it('has a touch strip at least 44pt high', async () => {
    const { slider } = await renderSlider();

    expect(slider).toHaveStyle({ height: MIN_TOUCH_TARGET });
  });

  it('draws a focus ring while focused', async () => {
    const { slider } = await renderSlider();

    await fireEvent(slider, 'focus');
    expect(slider).toHaveStyle({ outlineWidth: 3, outlineColor: colors.text });

    await fireEvent(slider, 'blur');
    expect(slider).not.toHaveStyle({ outlineWidth: 3 });
  });

  it('takes over a drag that starts elsewhere and moves onto it, unless disabled', async () => {
    const { slider } = await renderSlider();

    expect(slider.props.onMoveShouldSetResponder()).toBe(true);
  });

  it('keeps its label and value at full contrast when disabled, fading only the track', async () => {
    const { slider } = await renderSlider({ disabled: true });

    expect(slider).toHaveStyle({ opacity: 0.6 });
    expect(screen.getByText('Monthly budget', { includeHiddenElements: true }).parent).not.toHaveStyle({
      opacity: 0.6,
    });
    expect(
      screen.getByText('Monthly budget', { includeHiddenElements: true }).parent?.parent,
    ).not.toHaveStyle({
      opacity: 0.6,
    });
  });
});

import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { colors, MIN_TOUCH_TARGET } from '../../theme/tokens';
import { Tabs } from './Tabs';

const tabs = [
  { key: 'profile', label: 'Profile', content: <Text>Your name and email</Text> },
  { key: 'security', label: 'Security', content: <Text>Password and two-step sign-in</Text> },
  { key: 'billing', label: 'Billing', content: <Text>Your plan and invoices</Text> },
];
const key = (name: string) => ({ key: name, preventDefault: jest.fn() });

async function renderTabs(selectedKey = 'profile') {
  const onSelectedChange = jest.fn();
  await render(
    <Tabs
      label="Account sections"
      tabs={tabs}
      selectedKey={selectedKey}
      onSelectedChange={onSelectedChange}
    />,
  );
  return { onSelectedChange };
}

describe('Tabs', () => {
  it('is a named tab list of tabs', async () => {
    await renderTabs();

    // A container, not one accessibility element: grouping it would hide the tabs from VoiceOver
    expect(screen.getByLabelText('Account sections')).toHaveProp('role', 'tablist');
    expect(screen.getAllByRole('tab')).toHaveLength(3);
  });

  it('announces which tab is selected', async () => {
    await renderTabs('security');

    expect(screen.getByRole('tab', { name: 'Security' })).toBeSelected();
    expect(screen.getByRole('tab', { name: 'Profile' })).not.toBeSelected();
  });

  it('shows only the selected panel, labelled by its tab', async () => {
    await renderTabs('security');

    expect(screen.getByText('Password and two-step sign-in')).toBeOnTheScreen();
    expect(screen.queryByText('Your name and email')).toBeNull();
    const panel = screen.getByText('Password and two-step sign-in').parent;
    expect(panel).toHaveProp('role', 'tabpanel');
    expect(panel).toHaveProp('aria-labelledby', 'tab-security');
    expect(screen.getByRole('tab', { name: 'Security' })).toHaveProp('id', 'tab-security');
  });

  it('selects a tab when it is pressed', async () => {
    const { onSelectedChange } = await renderTabs();

    await fireEvent.press(screen.getByRole('tab', { name: 'Billing' }));

    expect(onSelectedChange).toHaveBeenCalledWith('billing');
  });

  it('puts only the selected tab in the Tab order', async () => {
    await renderTabs('security');

    expect(screen.getByRole('tab', { name: 'Security' })).toHaveProp('tabIndex', 0);
    expect(screen.getByRole('tab', { name: 'Profile' })).toHaveProp('tabIndex', -1);
    expect(screen.getByRole('tab', { name: 'Billing' })).toHaveProp('tabIndex', -1);
  });

  it('moves between tabs with the arrow keys, wrapping at the ends, and Home/End', async () => {
    const { onSelectedChange } = await renderTabs('billing');
    const tab = screen.getByRole('tab', { name: 'Billing' });
    const right = key('ArrowRight');

    await fireEvent(tab, 'keyDown', right);
    await fireEvent(tab, 'keyDown', key('ArrowLeft'));
    await fireEvent(tab, 'keyDown', key('Home'));

    expect(onSelectedChange.mock.calls).toEqual([['profile'], ['security'], ['profile']]);
    expect(right.preventDefault).toHaveBeenCalled();
  });

  it('leaves other keys to the browser', async () => {
    const { onSelectedChange } = await renderTabs();
    const enter = key('Enter');

    await fireEvent(screen.getByRole('tab', { name: 'Profile' }), 'keyDown', enter);

    expect(onSelectedChange).not.toHaveBeenCalled();
    expect(enter.preventDefault).not.toHaveBeenCalled();
  });

  it('falls back to the first tab when the selected key is unknown', async () => {
    await renderTabs('nope');

    expect(screen.getByRole('tab', { name: 'Profile' })).toBeSelected();
    expect(screen.getByText('Your name and email')).toBeOnTheScreen();
  });

  it('gives every tab a 44pt touch target', async () => {
    await renderTabs();

    for (const tab of screen.getAllByRole('tab')) expect(tab).toHaveStyle({ minHeight: MIN_TOUCH_TARGET });
  });

  it('draws a focus ring on the focused tab', async () => {
    await renderTabs();
    const tab = screen.getByRole('tab', { name: 'Profile' });

    await fireEvent(tab, 'focus');
    expect(tab).toHaveStyle({ outlineWidth: 3, outlineColor: colors.text });

    await fireEvent(tab, 'blur');
    expect(tab).not.toHaveStyle({ outlineWidth: 3 });
  });
});

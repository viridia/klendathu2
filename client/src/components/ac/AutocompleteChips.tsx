// tslint:disable:jsx-no-lambda
import * as classNames from 'classnames';
import * as React from 'react';
import { FormControl, FormControlProps } from 'react-bootstrap';
import * as ReactDOM from 'react-dom';
import autobind from '../../lib/autobind';
import './AutocompleteChips.scss';

interface Props<S> {
  selection: S | S[];
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
  maxLength?: number;
  multiple?: boolean;
  onSearch: (search: string, callback: (suggestion: S[], suffixActions?: S[]) => void) => void;
  onChooseSuggestion?: (suggestion: S, callback: (suggestion: S) => void) => boolean;
  onRenderSuggestion?: (suggestion: S) => JSX.Element;
  onRenderSelection?: (suggestion: S) => JSX.Element;
  onGetValue?: (suggestion: S) => string;
  onGetSortKey?: (suggestion: S) => string;
  onEnter?: () => void;
  onSelectionChange: (selection: S | S[] | null) => void;
}

interface State<S> {
  open: boolean;
  valid: boolean;
  focused: boolean;
  suggestions: S[];
  suffixActions: any[];
  suggestionIndex: number;
  value: string;
}

export default class AutoCompleteChips<S> extends React.Component<Props<S>, State<S>> {
  public static defaultProps = {
    onChooseSuggestion: () => false,
    onRenderSuggestion: (suggestion: any) => suggestion,
    onGetValue: (suggestion: any) => suggestion,
    onGetSortKey: (suggestion: any) => ('' + suggestion).toLowerCase(),
  };

  private searchValue: string;
  private timer: any;
  private menu: HTMLUListElement;
  private input: React.Component<FormControlProps, {}>;

  constructor(props: Props<S>) {
    super(props);
    this.state = {
      open: false,
      valid: false,
      focused: false,
      suggestions: [],
      suffixActions: [],
      suggestionIndex: -1,
      value: '',
    };
    this.searchValue = null;
    this.timer = null;
  }

  public omponentDidUpdate(prevProps: Props<S>, prevState: State<S>) {
    if (this.menu && !prevState.open && this.state.open) {
      this.menu.scrollIntoView(false);
    }
  }

  public componentWillUnmount() {
    clearTimeout(this.timer);
  }

  public render() {
    const { className, maxLength, placeholder, autoFocus } = this.props;
    const { value, valid, open, focused } = this.state;
    const selection = this.selection();
    const editing = value.length > 0;
    return (
      <div
          className={classNames('autocomplete dropdown',
            className, { valid, open, focused, editing })}
          onMouseDown={this.onClickContainer}
      >
        {this.renderSelection()}
        <FormControl
            type="text"
            bsClass="ac-input"
            placeholder={selection.length > 0 ? null : placeholder}
            ref={el => { this.input = el; }}
            autoFocus={autoFocus}
            value={value}
            maxLength={maxLength}
            onChange={this.onValueChange}
            onKeyDown={this.onKeyDown}
            onFocus={this.onFocus}
            onBlur={this.onBlur}
        />
        <ul
            role="menu"
            ref={el => { this.menu = el; }}
            className="ac-menu dropdown-menu"
        >
          {this.renderSuggestions()}
        </ul>
      </div>
    );
  }

  private renderSuggestions(): JSX.Element[] {
    const { onGetValue, onRenderSuggestion } = this.props;
    const { suggestions, suffixActions, suggestionIndex } = this.state;
    const menu = suggestions.map((s, index) => {
      const value = onGetValue(s);
      const active = index === suggestionIndex;
      return (
        <li
            className={classNames({ active })}
            key={value}
            role="presentation"
        >
          <a
              role="menuitem"
              tabIndex={-1}
              href=""
              data-index={index}
              onClick={e => this.onClickSuggestion(e, s)}
          >
            {onRenderSuggestion(s)}
          </a>
        </li>
      );
    });
    if (menu.length > 0 && suffixActions.length > 0) {
      menu.push(<hr key="-hr-" />);
    }
    const suffix = suffixActions.map((s, index) => {
      const value = onGetValue(s);
      const active = index === suggestionIndex - suggestions.length;
      return (
        <li
            className={classNames({ active })}
            key={value}
            role="presentation"
        >
          <a
              role="menuitem"
              tabIndex={-1}
              href=""
              data-index={index}
              onClick={e => this.onClickSuggestion(e, s)}
          >
            {onRenderSuggestion(s)}
          </a>
        </li>
      );
    });
    return menu.concat(suffix);
  }

  private renderSelection() {
    const selection = this.selection();
    const result = [];
    for (let i = 0; i < selection.length; i += 1) {
      const item = selection[i];
      const value = this.props.onGetValue(item);
      const last = (i === selection.length - 1) && this.state.value.length === 0;
      const chip = this.props.onRenderSelection(item);
      result.push(
        <span className={classNames('ac-chip-wrapper', { last })} key={value}>
          {chip}
        </span>,
      );
    }
    return result;
  }

  @autobind
  private onValueChange(e: any) {
    let value = e.target.value;
    // Don't allow typing if it's a non-multiple and we already have a value.
    if (!this.props.multiple && this.selection().length > 0) {
      value = '';
    }
    this.setState({ value });
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      if (value !== this.searchValue) {
        this.searchValue = value;
        this.props.onSearch(this.searchValue, this.onReceiveSuggestions);
      }
    }, 30);
  }

  @autobind
  private onFocus() {
    this.setState({ focused: true });
    if (this.state.value.length === 0) {
      this.searchValue = this.state.value;
      this.props.onSearch(this.searchValue, this.onReceiveSuggestions);
    }
  }

  @autobind
  private onBlur() {
    this.setState({ focused: false, open: false });
  }

  @autobind
  private onClickContainer(e: any) {
    e.preventDefault();
    const inputEl = ReactDOM.findDOMNode(this.input) as HTMLInputElement;
    inputEl.focus();
  }

  @autobind
  private onClickSuggestion(e: any, item: S) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({
      value: '',
      open: false,
    });
    this.searchValue = '';
    this.chooseSuggestion(item);
  }

  @autobind
  private onReceiveSuggestions(suggestions: S[], suffixActions: S[] = []) {
    const alreadySelected = new Set(this.selection().map(s => this.props.onGetValue(s)));
    const uniqueSuggestions =
      suggestions.filter(s => !alreadySelected.has(this.props.onGetValue(s)));
    const suggestionCount = uniqueSuggestions.length + suffixActions.length;
    this.setState({
      suggestions: uniqueSuggestions,
      suffixActions,
      open: suggestionCount > 0,
      suggestionIndex: uniqueSuggestions.length > 0 ? 0 : -1,
    });
    if (this.state.value !== this.searchValue) {
      this.searchValue = this.state.value;
      this.props.onSearch(this.searchValue, this.onReceiveSuggestions);
    }
  }

  @autobind
  private onKeyDown(e: any) {
    const { suggestions, suffixActions, suggestionIndex } = this.state;
    const suggestionCount = suggestions.length + suffixActions.length;
    switch (e.keyCode) {
      case 40: // DOWN
        if (suggestionCount > 0) {
          e.preventDefault();
          e.stopPropagation();
          let index = suggestionIndex + 1;
          if (index >= suggestionCount) {
            index = 0;
          }
          this.setState({
            suggestionIndex: index,
            open: true,
          });
        }
        break;
      case 38: // UP
        if (suggestionCount > 0 && this.state.open) {
          e.preventDefault();
          e.stopPropagation();
          let index = suggestionIndex - 1;
          if (index < 0) {
            index = -1;
          }
          this.setState({ suggestionIndex: index });
        }
        break;
      case 13: // RETURN
        e.preventDefault();
        e.stopPropagation();
        if (suggestionCount > 0 && suggestionIndex !== -1) {
          if (!this.state.open) {
            if (this.props.onEnter) {
              this.props.onEnter();
            }
          } else {
            const item = suggestions.concat(suffixActions)[suggestionIndex];
            this.setState({
              value: '',
              open: false,
            });
            this.searchValue = '';
            this.chooseSuggestion(item);
          }
        } else if (this.props.onEnter) {
          this.props.onEnter();
        }
        break;
      case 8: // BACKSPACE
        {
          // Remove the last chip from the selection.
          const inputEl = ReactDOM.findDOMNode(this.input) as HTMLInputElement;
          if (inputEl.selectionStart === 0 && inputEl.selectionEnd === 0) {
            this.deleteLastSelectedItem();
          }
        }
        break;
      case 9: // TAB
      case 27: // ESC
      default:
        break;
    }
  }

  private deleteLastSelectedItem() {
    if (this.selection().length > 0) {
      this.updateSelection(this.selection().slice(0, -1));
    }
  }

  private chooseSuggestion(suggestion: S) {
    if (!suggestion) {
      throw new Error('Invalid suggestion.');
    }
    const callback = (s: S) => { this.addToSelection(s); };
    const done = this.props.onChooseSuggestion(suggestion, callback);
    if (!done) {
      this.addToSelection(suggestion);
    }
  }

  private addToSelection(item: S) {
    let selection = this.selection();
    for (const s of selection) {
      // Value is already in the list.
      if (this.props.onGetValue(item) === this.props.onGetValue(s)) {
        return;
      }
    }
    selection = selection.concat([item]);
    selection.sort((a, b) => {
      const aKey = this.props.onGetSortKey(a);
      const bKey = this.props.onGetSortKey(b);
      if (aKey < bKey) { return -1; }
      if (aKey < bKey) { return 1; }
      return 0;
    });
    this.updateSelection(selection);
  }

  private updateSelection(selection: S[]) {
    if (this.props.multiple) {
      this.props.onSelectionChange(selection);
    } else if (selection.length > 0) {
      this.props.onSelectionChange(selection[0]);
    } else {
      this.props.onSelectionChange(null);
    }
  }

  private selection() {
    if (Array.isArray(this.props.selection)) {
      return this.props.selection;
    } else if (this.props.selection === null || this.props.selection === undefined) {
      return [];
    } else {
      return [this.props.selection];
    }
  }
}

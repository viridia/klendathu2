import autobind from 'bind-decorator';
import * as classNames from 'classnames';
import * as React from 'react';
import { FormControl } from 'react-bootstrap';
import './AutocompleteChips.scss';

export type SearchCallback = (suggestions: string[]) => void;

interface Props {
  value: string;
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
  maxLength?: number;
  onSearch: (search: string, callback: SearchCallback) => void;
  onChooseSuggestion?: (suggestion: string, callback: (suggestion: string) => void) => boolean;
  onRenderSuggestion?: (suggestion: string) => JSX.Element;
  onGetValue?: (suggestion: string) => any;
  onEnter?: () => void;
  onChange: (value: string) => void;
}

interface State {
  open: boolean;
  valid: boolean;
  focused: boolean;
  suggestions: string[];
  suggestionIndex: number;
  value: string;
}

/** An autocomplete component that presents suggestions for completing the typed text. */
export default class Autocomplete extends React.Component<Props, State> {
  public static defaultProps = {
    onChooseSuggestion: () => false,
    onRenderSuggestion: (suggestion: any) => suggestion,
    onGetValue: (suggestion: any) => suggestion,
  };

  private searchValue: string;
  private timer: any;
  private input: React.Component;
  private menu: HTMLUListElement;

  constructor(props: Props) {
    super(props);
    this.state = {
      open: false,
      valid: false,
      focused: false,
      suggestions: [],
      suggestionIndex: -1,
      value: '',
    };
    this.searchValue = null;
    this.timer = null;
  }

  public componentDidUpdate(prevProps: Props, prevState: State) {
    if (this.menu && !prevState.open && this.state.open) {
      this.menu.scrollIntoView(false);
    }
  }

  public componentWillUnmount() {
    clearTimeout(this.timer);
  }

  public render() {
    const { value, className, maxLength, placeholder, autoFocus } = this.props;
    const { valid, open, focused } = this.state;
    const editing = value.length > 0;
    return (
      <div
          className={classNames('autocomplete dropdown',
            className, { valid, open, focused, editing })}
      >
        <FormControl
            type="text"
            bsClass="ac-input"
            placeholder={value.length > 0 ? null : placeholder}
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
            aria-labelledby="labels"
        >
          {this.renderSuggestions()}
        </ul>
      </div>
    );
  }

  private chooseSuggestion(suggestion: string) {
    if (!suggestion) {
      throw new Error('Invalid suggestion.');
    }
    const value = this.props.onGetValue(suggestion);
    this.setState({ value, open: false });
    this.props.onChange(value);
  }

  private renderSuggestions() {
    const { onGetValue, onRenderSuggestion } = this.props;
    const { suggestions, suggestionIndex } = this.state;
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
              onClick={e => { this.onClickSuggestion(e, s); }}
          >
            {onRenderSuggestion(s)}
          </a>
        </li>
      );
    });
    return menu;
  }

  @autobind
  private onValueChange(e: any) {
    const value = e.target.value;
    this.props.onChange(value);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      if (value !== this.searchValue) {
        this.searchValue = this.props.value;
        this.props.onSearch(this.searchValue, this.onReceiveSuggestions);
      }
    }, 30);
  }

  @autobind
  private onFocus() {
    this.setState({ focused: true });
  }

  @autobind
  private onBlur() {
    // Wait until we've had a chance to process click events before obliterating the menu dom.
    setTimeout(() => {
      this.setState({ focused: false, open: false });
    }, 1);
  }

  @autobind
  private onClickSuggestion(e: any, item: string) {
    e.preventDefault();
    e.stopPropagation();
    this.searchValue = '';
    this.chooseSuggestion(item);
  }

  @autobind
  private onReceiveSuggestions(suggestions: string[]) {
    this.setState({
      suggestions,
      open: suggestions.length > 0,
      suggestionIndex: suggestions.indexOf(this.props.value),
    });
    if (this.props.value !== this.searchValue) {
      this.searchValue = this.props.value;
      this.props.onSearch(this.searchValue, this.onReceiveSuggestions);
    }
  }

  @autobind
  private onKeyDown(e: any) {
    const { suggestions, suggestionIndex } = this.state;
    const suggestionCount = suggestions.length;
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
            const item = suggestions[suggestionIndex];
            this.setState({
              value: '',
              open: false,
            });
            this.searchValue = '';
            this.chooseSuggestion(item);
            if (this.props.onEnter) {
              this.props.onEnter();
            }
          }
        } else if (this.props.onEnter) {
          this.props.onEnter();
        }
        break;
      case 27: // ESC
        if (this.state.open) {
          this.setState({ open: false });
        }
        break;
      case 9: // TAB
      default:
        break;
    }
  }
}

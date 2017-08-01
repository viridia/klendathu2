import { Attachment } from './Attachment';
import { Change } from './Change';
import { Comment } from './Comment';
import { Label } from './Label';
import { LinkedIssue } from './LinkedIssue';

enum CustomFieldType {
  STRING = 's',
  NUMBER = 'n',
  BOOLEAN = 'b',
}

/** A custom field value with string type. */
export interface CustomStringValue {
  type: CustomFieldType.STRING;

  value: string;
}

/** A custom field value with number type. */
export interface CustomNumberValue {
  type: CustomFieldType.NUMBER;

  value: number;
}

/** A custom field value with boolean type. */
export interface CustomBooleanValue {
  type: CustomFieldType.BOOLEAN;

  value: boolean;
}

/** Data for a custom field. */
export interface CustomField {
  name: string;

  /** Value of the custom field. */
  value: CustomStringValue | CustomNumberValue | CustomBooleanValue;
}

/** An issue. */
export interface Issue {
  /** Unique id of this issue. */
  id: number;

  /** ID of the project this issue belongs to. */
  project: string;

  /** Issue type (defined by template). */
  type: string;

  /** Current workflow state. */
  state: string;

  /** One-line summary of the issue. */
  summary: string;

  /** Detailed description of the issue. */
  description: string;

  /** Username of user that originally reported this issue. */
  reporter: string;

  /** Username of current owner of this issue. */
  owner: string;

  /** Current owner of this issue, as a user object. */
  // ownerData: User;
      // resolve(issue, args, context, options) {
      //   return options.rootValue.singleUser({ username: issue.owner });
      // },

  /** Users who wish to be informed when this issue is updated. */
  cc: string[];
    // ccData: {
    //   type: new GraphQLList(new GraphQLNonNull(userType)),
    //   description: 'Users who wish to be informed when this issue is updated (as User objects).',
    //   // resolve(issue, args, context, options) {
    //   //   return issue.cc.map(cc => options.rootValue.singleUser({ username: cc }));
    //   // },
    // },

  /** Date and time when the issue was created. */
  created: Date;

  /** Date and time when the issue was last changed. */
  updated: Date;

  /** Labels associated with this issue. */
  labels: number[];

  /** Labels associated with this issue (expanded). */
  labelProps: Label[];

      // resolve(issue, args, context, options) {
      //   if (issue.labels.length === 0) {
      //     return [];
      //   }
      //   return options.rootValue.labelsById({ project: issue.project, idList: issue.labels });
      // },

  /** List of issues linked to this one. */
  linked: LinkedIssue[];

  /** Linked issue that includes this one, for convenience. */
  parent?: number;
      // resolve(issue) {
      //   for (const { relation, to } of issue.linked) {
      //     if (relation === 'included-by') {
      //       return to;
      //     }
      //   }
      //   return null;
      // },

  /** List of custom fields for this issue. */
  custom: CustomField[];

  /** List of comments on this issue. */
  comments: Comment[];

  /** List of attachments for this issue, as URLs. */
  attachments: string[];

  /** Details for the list of attachments. */
  attachmentsDetails: Attachment[];
      // resolve(issue, args, context, options) {
      //   if (!issue.attachments || issue.attachments.length === 0) {
      //     return [];
      //   }
      //   return options.rootValue.attachmentsById({ idList: issue.attachments });
      // },

  /** Whether this issue should be visible to non-members of the project. */
  public?: boolean;

  /** History of changes for this issue. */
  changes?: Change[];

  /** Relevance score for text searches. */
  score: number;
}

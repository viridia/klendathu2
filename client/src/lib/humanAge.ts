export default function humanAge(date: Date, brief = false): string {
  if (!date) {
    return 'a while ago';
  }
  const ms = Date.now() - date.getTime();
  const seconds = Math.floor(ms / 1000);
  if (seconds === 1) {
    if (brief) {
      return '1s';
    }
    return '1 second ago';
  }
  if (seconds < 60) {
    if (brief) {
      return `${seconds}s`;
    }
    return `${seconds} seconds ago`;
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes <= 1) {
    if (brief) {
      return '1m';
    }
    return '1 minute ago';
  }
  if (minutes < 60) {
    if (brief) {
      return `${minutes}m`;
    }
    return `${minutes} minutes ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours <= 1) {
    if (brief) {
      return '1h';
    }
    return '1 hour ago';
  }
  if (hours < 24) {
    if (brief) {
      return `${hours}h`;
    }
    return `${hours} hours ago`;
  }
  const days = Math.floor(hours / 24);
  if (days <= 1) {
    if (brief) {
      return '1d';
    }
    return '1 day ago';
  }
  if (days < 25) {
    if (brief) {
      return `${days}d`;
    }
    return `${days} days ago`;
  }
  const months = Math.floor(days / 30);
  if (months <= 1) {
    if (brief) {
      return '1mo';
    }
    return '1 month ago';
  }
  if (months < 12) {
    if (brief) {
      return `${months}mo`;
    }
    return `${months} months ago`;
  }
  const years = Math.floor(days / 365);
  if (brief) {
    return `${years}y`;
  }
  return `${years} years ago`;
}
